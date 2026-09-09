import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReferenceArray;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.LockSupport;
import java.util.function.Consumer;
import java.util.function.IntConsumer;

public final class AlternatingPrint {
    private AlternatingPrint() {}

    public static void abc(String mode, int rounds, Consumer<String> output, long timeoutMillis)
            throws Exception {
        validate(rounds, timeoutMillis);
        Objects.requireNonNull(output);
        List<Callable<Void>> tasks;
        switch (mode) {
            case "monitor": tasks = monitor(rounds, output); break;
            case "condition": tasks = conditions(rounds, output); break;
            case "semaphore": tasks = semaphores(rounds, output); break;
            case "locksupport": tasks = parking(rounds, output); break;
            default: throw new IllegalArgumentException("unknown mode: " + mode);
        }
        runWorkers(tasks, timeoutMillis);
    }

    // #region monitor
    private static List<Callable<Void>> monitor(int rounds, Consumer<String> output) {
        Object lock = new Object();
        int[] turn = {0}; // only accessed while holding lock
        List<Callable<Void>> tasks = new ArrayList<>();
        for (int id = 0; id < 3; id++) {
            final int mine = id;
            tasks.add(() -> {
                for (int i = 0; i < rounds; i++) {
                    synchronized (lock) {
                        while (turn[0] != mine) lock.wait();
                        if (Thread.currentThread().isInterrupted()) throw new InterruptedException();
                        output.accept(String.valueOf((char) ('A' + mine)));
                        turn[0] = (mine + 1) % 3;
                        lock.notifyAll();
                    }
                }
                return null;
            });
        }
        return tasks;
    }
    // #endregion monitor

    // #region condition
    private static List<Callable<Void>> conditions(int rounds, Consumer<String> output) {
        ReentrantLock lock = new ReentrantLock();
        Condition[] conditions = {lock.newCondition(), lock.newCondition(), lock.newCondition()};
        int[] turn = {0};
        List<Callable<Void>> tasks = new ArrayList<>();
        for (int id = 0; id < 3; id++) {
            final int mine = id;
            tasks.add(() -> {
                for (int i = 0; i < rounds; i++) {
                    lock.lockInterruptibly();
                    try {
                        while (turn[0] != mine) conditions[mine].await();
                        output.accept(String.valueOf((char) ('A' + mine)));
                        turn[0] = (mine + 1) % 3;
                        conditions[turn[0]].signal();
                    } finally {
                        lock.unlock();
                    }
                }
                return null;
            });
        }
        return tasks;
    }
    // #endregion condition

    // #region semaphore
    private static List<Callable<Void>> semaphores(int rounds, Consumer<String> output) {
        Semaphore[] gates = {new Semaphore(1), new Semaphore(0), new Semaphore(0)};
        List<Callable<Void>> tasks = new ArrayList<>();
        for (int id = 0; id < 3; id++) {
            final int mine = id;
            tasks.add(() -> {
                for (int i = 0; i < rounds; i++) {
                    gates[mine].acquire();
                    output.accept(String.valueOf((char) ('A' + mine)));
                    // Hand over only after successful output; failures cancel the group.
                    gates[(mine + 1) % 3].release();
                }
                return null;
            });
        }
        return tasks;
    }
    // #endregion semaphore

    // #region locksupport
    private static List<Callable<Void>> parking(int rounds, Consumer<String> output) {
        LockSupport.getBlocker(Thread.currentThread()); // Initialize before publishing worker roles.
        class State { volatile int turn = 0; }
        State state = new State();
        AtomicReferenceArray<Thread> roles = new AtomicReferenceArray<>(3);
        List<Callable<Void>> tasks = new ArrayList<>();
        for (int id = 0; id < 3; id++) {
            final int mine = id;
            tasks.add(() -> {
                roles.set(mine, Thread.currentThread());
                for (int i = 0; i < rounds; i++) {
                    while (state.turn != mine) {
                        if (Thread.interrupted()) throw new InterruptedException();
                        LockSupport.park(state);
                    }
                    if (Thread.interrupted()) throw new InterruptedException();
                    output.accept(String.valueOf((char) ('A' + mine)));
                    int next = (mine + 1) % 3;
                    state.turn = next; // Publish condition before waking next role.
                    LockSupport.unpark(roles.get(next));
                }
                return null;
            });
        }
        return tasks;
    }
    // #endregion locksupport

    // #region oddEven
    public static void oddEven(int limit, IntConsumer output, long timeoutMillis) throws Exception {
        validate(limit, timeoutMillis);
        Objects.requireNonNull(output);
        Object lock = new Object();
        long[] next = {1}; // long avoids overflow after Integer.MAX_VALUE
        List<Callable<Void>> tasks = new ArrayList<>();
        for (int parity = 0; parity < 2; parity++) {
            final int mine = parity;
            tasks.add(() -> {
                synchronized (lock) {
                    while (true) {
                        while (next[0] <= limit && next[0] % 2 != mine) lock.wait();
                        if (Thread.currentThread().isInterrupted()) throw new InterruptedException();
                        if (next[0] > limit) {
                            lock.notifyAll();
                            return null;
                        }
                        output.accept((int) next[0]++);
                        lock.notifyAll();
                    }
                }
            });
        }
        runWorkers(tasks, timeoutMillis);
    }
    // #endregion oddEven

    private static void validate(int count, long timeoutMillis) {
        if (count < 0) throw new IllegalArgumentException("count must be nonnegative");
        if (timeoutMillis <= 0 || timeoutMillis > 60000)
            throw new IllegalArgumentException("demo deadline must be in 1..60000 ms");
    }

    // #region supervisor
    private static void runWorkers(List<Callable<Void>> tasks, long timeoutMillis) throws Exception {
        AtomicInteger sequence = new AtomicInteger();
        ExecutorService pool = Executors.newFixedThreadPool(tasks.size(), r ->
            new Thread(r, "alternating-worker-" + sequence.incrementAndGet()));
        CompletionService<Void> completed = new ExecutorCompletionService<>(pool);
        List<Future<Void>> futures = new ArrayList<>();
        long deadline = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(timeoutMillis);
        try {
            // Deliberately submit C, B, A: submission order is not the print protocol.
            for (int i = tasks.size() - 1; i >= 0; i--) futures.add(completed.submit(tasks.get(i)));
            for (int i = 0; i < tasks.size(); i++) {
                long remaining = deadline - System.nanoTime();
                if (remaining <= 0) throw new TimeoutException("printing deadline exceeded");
                Future<Void> done = completed.poll(remaining, TimeUnit.NANOSECONDS);
                if (done == null) throw new TimeoutException("printing deadline exceeded");
                done.get(); // Observe whichever worker failed first, not submission order.
            }
        } finally {
            for (Future<Void> future : futures) future.cancel(true);
            pool.shutdownNow();
            if (!pool.awaitTermination(5, TimeUnit.SECONDS))
                throw new IllegalStateException("output callback did not stop cooperatively");
        }
    }
    // #endregion supervisor

    // #region main
    public static void main(String[] args) throws Exception {
        String mode = args.length > 0 ? args[0] : "semaphore";
        int count = args.length > 1 ? Integer.parseInt(args[1]) : 10;
        if ("odd-even".equals(mode)) oddEven(count, x -> System.out.print(x + " "), 5000);
        else abc(mode, count, System.out::print, 5000);
        System.out.println();
    }
    // #endregion main
}
