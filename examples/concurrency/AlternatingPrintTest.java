import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicInteger;

public class AlternatingPrintTest {
    private static int assertions;

    private static void check(boolean ok, String message) {
        assertions++;
        if (!ok) throw new AssertionError(message);
    }

    public static void main(String[] args) throws Exception {
        for (String mode : new String[]{"monitor", "condition", "semaphore", "locksupport"}) {
            for (int repeat = 0; repeat < 10; repeat++) {
                for (int rounds : new int[]{0, 1, 2, 100}) {
                    StringBuilder actual = new StringBuilder();
                    AlternatingPrint.abc(mode, rounds, actual::append, 5000);
                    StringBuilder expected = new StringBuilder();
                    for (int i = 0; i < rounds; i++) expected.append("ABC");
                    check(actual.toString().equals(expected.toString()), mode + ": order/count");
                }
            }
            try {
                AlternatingPrint.abc(mode, -1, s -> {}, 5000);
                throw new AssertionError("negative rounds accepted");
            } catch (IllegalArgumentException expected) { assertions++; }

            AtomicInteger outputs = new AtomicInteger();
            try {
                AlternatingPrint.abc(mode, 100, s -> {
                    if (s.equals("B")) throw new IllegalStateException("sink failed");
                    outputs.incrementAndGet();
                }, 5000);
                throw new AssertionError("worker failure hidden");
            } catch (ExecutionException expected) {
                check(expected.getCause() instanceof IllegalStateException, "original failure");
                check(outputs.get() == 1, "no passing baton after failure");
            }

            CountDownLatch never = new CountDownLatch(1);
            try {
                AlternatingPrint.abc(mode, 1, s -> {
                    try { never.await(); }
                    catch (InterruptedException ex) {
                        Thread.currentThread().interrupt();
                        throw new IllegalStateException(ex);
                    }
                }, 100);
                throw new AssertionError("missing deadline");
            } catch (TimeoutException expected) { assertions++; }

            Thread.currentThread().interrupt();
            try {
                AlternatingPrint.abc(mode, 100, s -> {}, 5000);
                throw new AssertionError("caller interruption ignored");
            } catch (InterruptedException expected) { assertions++; }
            finally { Thread.interrupted(); }
        }
        for (int limit : new int[]{0, 1, 2, 99, 100}) {
            StringBuilder actual = new StringBuilder();
            AlternatingPrint.oddEven(limit, x -> actual.append(x).append(','), 5000);
            StringBuilder expected = new StringBuilder();
            for (int i = 1; i <= limit; i++) expected.append(i).append(',');
            check(actual.toString().equals(expected.toString()), "odd/even boundary " + limit);
        }
        check(Thread.getAllStackTraces().keySet().stream()
            .noneMatch(t -> t.isAlive() && t.getName().startsWith("alternating-worker-")),
            "worker threads must terminate before return");
        System.out.println("PASS: " + assertions + " assertions");
    }
}
