import java.util.*;

/** Dependency-free, deterministic checks; invoked by tests/algorithms.test.mjs. */
public class InterviewAlgorithmsTest {
    private static int assertions;
    private static void check(boolean ok) { assertions++; if (!ok) throw new AssertionError("Check " + assertions); }
    private static void eq(int expected, int actual) { assertions++; if (expected != actual) throw new AssertionError("Check " + assertions + ": expected " + expected + ", actual " + actual); }
    private static void arr(int[] expected, int[] actual) { check(Arrays.equals(expected, actual)); }
    private static InterviewAlgorithms.ListNode list(int... values) {
        InterviewAlgorithms.ListNode dummy = new InterviewAlgorithms.ListNode(0), tail = dummy;
        for (int value : values) { tail.next = new InterviewAlgorithms.ListNode(value); tail = tail.next; }
        return dummy.next;
    }
    private static int[] values(InterviewAlgorithms.ListNode head) {
        List<Integer> result = new ArrayList<>();
        while (head != null) { if (result.size() > 100) throw new AssertionError("Unexpected cycle"); result.add(head.val); head = head.next; }
        return result.stream().mapToInt(Integer::intValue).toArray();
    }
    private static InterviewAlgorithms.TreeNode tree(int value) { return new InterviewAlgorithms.TreeNode(value); }
    public static void main(String[] args) {
        arr(new int[]{0, 1}, InterviewAlgorithms.twoSum(new int[]{2, 7, 11}, 9));
        arr(new int[]{0, 1}, InterviewAlgorithms.twoSum(new int[]{3, 3}, 6));
        arr(new int[]{0, 1}, InterviewAlgorithms.twoSum(new int[]{Integer.MIN_VALUE, Integer.MAX_VALUE}, -1));
        eq(2, InterviewAlgorithms.lengthOfLongestSubstring("abba"));
        eq(0, InterviewAlgorithms.lengthOfLongestSubstring(""));
        check(InterviewAlgorithms.threeSum(new int[]{-1, 0, 1, 2, -1, -4}).equals(Arrays.asList(Arrays.asList(-1, -1, 2), Arrays.asList(-1, 0, 1))));
        eq(1, InterviewAlgorithms.threeSum(new int[]{0, 0, 0, 0}).size());
        eq(3, InterviewAlgorithms.subarraySum(new int[]{0, 0}, 0));
        eq(3, InterviewAlgorithms.subarraySum(new int[]{1, -1, 0}, 0));
        eq(-1, InterviewAlgorithms.search(new int[]{}, 1));
        eq(1, InterviewAlgorithms.search(new int[]{-2, 4, 9}, 4));
        arr(new int[]{0, 1}, InterviewAlgorithms.searchRange(new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE}, Integer.MAX_VALUE));
        arr(new int[]{-1, -1}, InterviewAlgorithms.searchRange(new int[]{}, 0));
        arr(new int[]{3, 2, 1}, values(InterviewAlgorithms.reverseList(list(1, 2, 3))));
        check(InterviewAlgorithms.reverseList(null) == null);
        InterviewAlgorithms.ListNode cycle = list(1, 2); cycle.next.next = cycle;
        check(InterviewAlgorithms.hasCycle(cycle)); check(!InterviewAlgorithms.hasCycle(list(1, 2)));
        arr(new int[]{1, 1, 2, 3}, values(InterviewAlgorithms.mergeTwoLists(list(1, 3), list(1, 2))));
        check(InterviewAlgorithms.mergeTwoLists(null, null) == null);
        arr(new int[]{1, 3}, values(InterviewAlgorithms.removeNthFromEnd(list(1, 2, 3), 2)));
        check(InterviewAlgorithms.removeNthFromEnd(list(1), 1) == null);
        check(InterviewAlgorithms.isValid("{[()]}")); check(!InterviewAlgorithms.isValid("([)]")); check(!InterviewAlgorithms.isValid("("));
        arr(new int[]{1, 1, 4, 2, 1, 1, 0, 0}, InterviewAlgorithms.dailyTemperatures(new int[]{73, 74, 75, 71, 69, 72, 76, 73}));
        arr(new int[]{0, 0}, InterviewAlgorithms.dailyTemperatures(new int[]{30, 30}));
        arr(new int[]{3, 3, 5, 5, 6, 7}, InterviewAlgorithms.maxSlidingWindow(new int[]{1, 3, -1, -3, 5, 3, 6, 7}, 3));
        eq(5, InterviewAlgorithms.findKthLargest(new int[]{3, 2, 1, 5, 6, 4}, 2));
        eq(2, InterviewAlgorithms.findKthLargest(new int[]{2, 2, 1}, 2));
        InterviewAlgorithms.TreeNode root = tree(2); root.left = tree(1); root.right = tree(3);
        check(InterviewAlgorithms.levelOrder(root).equals(Arrays.asList(Arrays.asList(2), Arrays.asList(1, 3))));
        check(InterviewAlgorithms.levelOrder(null).isEmpty()); eq(2, InterviewAlgorithms.maxDepth(root)); eq(0, InterviewAlgorithms.maxDepth(null));
        check(InterviewAlgorithms.isValidBST(root)); check(InterviewAlgorithms.isValidBST(tree(Integer.MIN_VALUE)));
        root.right.left = tree(0); check(!InterviewAlgorithms.isValidBST(root)); root.right.left = null;
        check(InterviewAlgorithms.lowestCommonAncestor(root, root.left, root.right) == root);
        check(InterviewAlgorithms.lowestCommonAncestor(root, root, root.right) == root);
        char[][] grid = {{'1', '1', '0'}, {'0', '0', '1'}, {'1', '0', '1'}};
        eq(3, InterviewAlgorithms.numIslands(grid)); eq(3, InterviewAlgorithms.numIslands(grid)); // no mutation
        eq(0, InterviewAlgorithms.numIslands(new char[0][]));
        check(InterviewAlgorithms.canFinish(2, new int[][]{{1, 0}}));
        check(!InterviewAlgorithms.canFinish(2, new int[][]{{1, 0}, {0, 1}}));
        check(!InterviewAlgorithms.canFinish(1, new int[][]{{0, 0}}));
        eq(2, InterviewAlgorithms.findCircleNum(new int[][]{{1, 1, 0}, {1, 1, 0}, {0, 0, 1}}));
        eq(6, new HashSet<>(InterviewAlgorithms.permute(new int[]{1, 2, 3})).size());
        eq(1, InterviewAlgorithms.permute(new int[]{}).size());
        eq(8, new HashSet<>(InterviewAlgorithms.subsets(new int[]{1, 2, 3})).size());
        eq(1, InterviewAlgorithms.subsets(new int[]{}).size());
        eq(5, new HashSet<>(InterviewAlgorithms.generateParenthesis(3)).size());
        check(InterviewAlgorithms.generateParenthesis(0).equals(Arrays.asList("")));
        int[][] intervals = {{2, 4}, {1, 2}, {7, 9}};
        check(Arrays.deepEquals(new int[][]{{1, 4}, {7, 9}}, InterviewAlgorithms.merge(intervals)));
        check(Arrays.deepEquals(new int[][]{{2, 4}, {1, 2}, {7, 9}}, intervals));
        check(InterviewAlgorithms.canJump(new int[]{2, 3, 1, 1, 4}));
        check(!InterviewAlgorithms.canJump(new int[]{3, 2, 1, 0, 4})); check(InterviewAlgorithms.canJump(new int[]{0}));
        eq(5, InterviewAlgorithms.maxProfit(new int[]{7, 1, 5, 3, 6, 4})); eq(0, InterviewAlgorithms.maxProfit(new int[]{3, 2, 1}));
        eq(-1, InterviewAlgorithms.maxSubArray(new int[]{-3, -1, -2}));
        eq(12, InterviewAlgorithms.rob(new int[]{2, 7, 9, 3, 1})); eq(0, InterviewAlgorithms.rob(new int[]{}));
        eq(4, InterviewAlgorithms.lengthOfLIS(new int[]{10, 9, 2, 5, 3, 7, 101, 18})); eq(1, InterviewAlgorithms.lengthOfLIS(new int[]{2, 2}));
        eq(3, InterviewAlgorithms.longestCommonSubsequence("abcde", "ace")); eq(0, InterviewAlgorithms.longestCommonSubsequence("", "a"));
        eq(2, InterviewAlgorithms.coinChange(new int[]{1, 3, 4}, 6)); eq(-1, InterviewAlgorithms.coinChange(new int[]{2}, 3)); eq(0, InterviewAlgorithms.coinChange(new int[]{2}, 0));
        eq(4, InterviewAlgorithms.change(5, new int[]{1, 2, 5})); eq(1, InterviewAlgorithms.change(0, new int[]{2})); eq(0, InterviewAlgorithms.change(3, new int[]{2}));
        eq(2, InterviewAlgorithms.singleNumber(new int[]{-1, 2, -1}));
        arr(new int[]{-1, 2, 2, 5}, InterviewAlgorithms.sortArray(new int[]{5, 2, -1, 2}));
        randomChecks();
        System.out.println("PASS: " + assertions + " assertions");
    }
    private static void randomChecks() {
        Random random = new Random(20260908L);
        for (int round = 0; round < 200; round++) {
            int n = 1 + random.nextInt(12), target = random.nextInt(11) - 5;
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = random.nextInt(11) - 5;
            int[] sorted = a.clone(); Arrays.sort(sorted);
            arr(sorted, InterviewAlgorithms.sortArray(a));
            int first = -1, last = -1;
            for (int i = 0; i < n; i++) if (sorted[i] == target) { if (first < 0) first = i; last = i; }
            arr(new int[]{first, last}, InterviewAlgorithms.searchRange(sorted, target));
            int pos = InterviewAlgorithms.search(sorted, target);
            check(first < 0 ? pos == -1 : pos >= first && pos <= last);
            int matches = 0, best = Integer.MIN_VALUE;
            for (int i = 0; i < n; i++) {
                int sum = 0;
                for (int j = i; j < n; j++) { sum += a[j]; if (sum == target) matches++; best = Math.max(best, sum); }
            }
            eq(matches, InterviewAlgorithms.subarraySum(a, target)); eq(best, InterviewAlgorithms.maxSubArray(a));
            int k = 1 + random.nextInt(n);
            eq(sorted[n - k], InterviewAlgorithms.findKthLargest(a, k));
            int[] maxima = new int[n - k + 1];
            for (int i = 0; i + k <= n; i++) { maxima[i] = Integer.MIN_VALUE; for (int j = i; j < i + k; j++) maxima[i] = Math.max(maxima[i], a[j]); }
            arr(maxima, InterviewAlgorithms.maxSlidingWindow(a, k));
            int[] days = new int[n];
            for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) if (a[j] > a[i]) { days[i] = j - i; break; }
            arr(days, InterviewAlgorithms.dailyTemperatures(a));
            int[] lis = new int[n]; int longest = 0;
            for (int i = 0; i < n; i++) { lis[i] = 1; for (int j = 0; j < i; j++) if (a[j] < a[i]) lis[i] = Math.max(lis[i], lis[j] + 1); longest = Math.max(longest, lis[i]); }
            eq(longest, InterviewAlgorithms.lengthOfLIS(a));
            List<Integer> coins = new ArrayList<>();
            for (int c = 1; c <= 6; c++) if (random.nextBoolean()) coins.add(c);
            if (coins.isEmpty()) coins.add(2);
            Collections.shuffle(coins, random);
            int[] denominations = coins.stream().mapToInt(Integer::intValue).toArray();
            int amount = random.nextInt(16);
            eq(combinations(denominations, 0, amount), InterviewAlgorithms.change(amount, denominations));
            eq(minCoinsBfs(denominations, amount), InterviewAlgorithms.coinChange(denominations, amount));
        }
        // Unreachable target while unrelated intermediate combination counts exceed long.
        int[] evenCoins = new int[50]; for (int i = 0; i < 50; i++) evenCoins[i] = 2 * (i + 1);
        eq(0, InterviewAlgorithms.change(1001, evenCoins));
        for (int capacity = 0; capacity <= 5; capacity++) {
            InterviewAlgorithms.LRUCache cache = new InterviewAlgorithms.LRUCache(capacity);
            LinkedHashMap<Integer, Integer> reference = new LinkedHashMap<>(16, 0.75f, true);
            for (int i = 0; i < 300; i++) {
                int key = random.nextInt(9);
                if (random.nextBoolean()) {
                    int value = random.nextInt(100);
                    cache.put(key, value); reference.put(key, value);
                    if (reference.size() > capacity) reference.remove(reference.keySet().iterator().next());
                } else eq(reference.getOrDefault(key, -1), cache.get(key));
            }
        }
    }
    private static int combinations(int[] coins, int index, int amount) {
        if (index == coins.length) return amount == 0 ? 1 : 0;
        int total = 0;
        for (int left = amount; left >= 0; left -= coins[index]) total += combinations(coins, index + 1, left);
        return total;
    }
    private static int minCoinsBfs(int[] coins, int amount) {
        int[] distance = new int[amount + 1]; Arrays.fill(distance, -1); distance[0] = 0;
        ArrayDeque<Integer> queue = new ArrayDeque<>(); queue.add(0);
        while (!queue.isEmpty()) {
            int sum = queue.poll();
            for (int coin : coins) if (sum + coin <= amount && distance[sum + coin] < 0) { distance[sum + coin] = distance[sum] + 1; queue.offer(sum + coin); }
        }
        return distance[amount];
    }
}
