import java.util.*;
import java.math.BigInteger;

/** Original interview examples. Unless stated otherwise, use the linked LeetCode input contract. */
public final class InterviewAlgorithms {
    private InterviewAlgorithms() {}

    // #region nodes
    public static class ListNode {
        public int val;
        public ListNode next;
        public ListNode(int val) { this.val = val; }
    }
    public static class TreeNode {
        public int val;
        public TreeNode left, right;
        public TreeNode(int val) { this.val = val; }
    }
    // #endregion nodes

    // #region twoSum
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            long need = (long) target - nums[i];
            if (need >= Integer.MIN_VALUE && need <= Integer.MAX_VALUE) {
                Integer j = seen.get((int) need);
                if (j != null) return new int[]{j, i};
            }
            seen.put(nums[i], i); // Query first: do not reuse this position.
        }
        throw new IllegalArgumentException("No solution");
    }
    // #endregion twoSum

    // #region longestSubstring
    public static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            Integer old = last.put(s.charAt(right), right);
            if (old != null) left = Math.max(left, old + 1);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
    // #endregion longestSubstring

    // #region threeSum
    public static List<List<Integer>> threeSum(int[] nums) {
        int[] a = nums.clone();
        Arrays.sort(a);
        List<List<Integer>> result = new ArrayList<>();
        for (int i = 0; i + 2 < a.length; i++) {
            if (i > 0 && a[i] == a[i - 1]) continue;
            if (a[i] > 0) break;
            int left = i + 1, right = a.length - 1;
            while (left < right) {
                long sum = (long) a[i] + a[left] + a[right];
                if (sum < 0) left++;
                else if (sum > 0) right--;
                else {
                    result.add(Arrays.asList(a[i], a[left], a[right]));
                    int x = a[left], y = a[right];
                    while (left < right && a[left] == x) left++;
                    while (left < right && a[right] == y) right--;
                }
            }
        }
        return result;
    }
    // #endregion threeSum

    // #region subarraySum
    public static int subarraySum(int[] nums, int k) {
        Map<Long, Integer> count = new HashMap<>();
        count.put(0L, 1);
        long prefix = 0;
        int result = 0;
        for (int value : nums) {
            prefix += value;
            result += count.getOrDefault(prefix - k, 0);
            count.put(prefix, count.getOrDefault(prefix, 0) + 1);
        }
        return result;
    }
    // #endregion subarraySum

    // #region binarySearch
    public static int search(int[] nums, int target) {
        int left = 0, right = nums.length; // Candidate interval [left, right).
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid;
        }
        return -1;
    }
    // #endregion binarySearch

    // #region searchRange
    public static int[] searchRange(int[] nums, int target) {
        int left = lowerBound(nums, target);
        if (left == nums.length || nums[left] != target) return new int[]{-1, -1};
        return new int[]{left, lowerBound(nums, (long) target + 1) - 1};
    }
    private static int lowerBound(int[] nums, long target) {
        int left = 0, right = nums.length;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) left = mid + 1;
            else right = mid;
        }
        return left;
    }
    // #endregion searchRange

    // #region reverseList
    public static ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
    // #endregion reverseList

    // #region hasCycle
    public static boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
    // #endregion hasCycle

    // #region mergeTwoLists
    public static ListNode mergeTwoLists(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return dummy.next;
    }
    // #endregion mergeTwoLists

    // #region removeNth
    public static ListNode removeNthFromEnd(ListNode head, int n) {
        if (n <= 0) throw new IllegalArgumentException("n must be positive");
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        ListNode fast = dummy, slow = dummy;
        for (int i = 0; i < n; i++) {
            fast = fast.next;
            if (fast == null) throw new IllegalArgumentException("n exceeds length");
        }
        while (fast.next != null) { fast = fast.next; slow = slow.next; }
        slow.next = slow.next.next;
        return dummy.next;
    }
    // #endregion removeNth

    // #region validParentheses
    public static boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '[') stack.push(']');
            else if (c == '{') stack.push('}');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
    // #endregion validParentheses

    // #region dailyTemperatures
    public static int[] dailyTemperatures(int[] t) {
        int[] answer = new int[t.length];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < t.length; i++) {
            while (!stack.isEmpty() && t[i] > t[stack.peek()]) {
                int j = stack.pop();
                answer[j] = i - j;
            }
            stack.push(i);
        }
        return answer;
    }
    // #endregion dailyTemperatures

    // #region slidingMaximum
    public static int[] maxSlidingWindow(int[] nums, int k) {
        if (k < 1 || k > nums.length) throw new IllegalArgumentException("Invalid window");
        int[] answer = new int[nums.length - k + 1];
        Deque<Integer> deque = new ArrayDeque<>();
        for (int i = 0; i < nums.length; i++) {
            while (!deque.isEmpty() && deque.peekFirst() <= i - k) deque.pollFirst();
            while (!deque.isEmpty() && nums[deque.peekLast()] <= nums[i]) deque.pollLast();
            deque.offerLast(i);
            if (i >= k - 1) answer[i - k + 1] = nums[deque.peekFirst()];
        }
        return answer;
    }
    // #endregion slidingMaximum

    // #region kthLargest
    public static int findKthLargest(int[] nums, int k) {
        if (k < 1 || k > nums.length) throw new IllegalArgumentException("Invalid k");
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int n : nums) {
            heap.offer(n);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }
    // #endregion kthLargest

    // #region levelOrder
    public static List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> answer = new ArrayList<>();
        if (root == null) return answer;
        Deque<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            answer.add(level);
        }
        return answer;
    }
    // #endregion levelOrder

    // #region maxDepth
    public static int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }
    // #endregion maxDepth

    // #region validBST
    public static boolean isValidBST(TreeNode root) {
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode node = root;
        long previous = Long.MIN_VALUE;
        while (node != null || !stack.isEmpty()) {
            while (node != null) { stack.push(node); node = node.left; }
            node = stack.pop();
            if (node.val <= previous) return false;
            previous = node.val;
            node = node.right;
        }
        return true;
    }
    // #endregion validBST

    // #region lca
    public static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if (left != null && right != null) return root;
        return left != null ? left : right;
    }
    // #endregion lca

    // #region islands
    public static int numIslands(char[][] grid) {
        if (grid.length == 0 || grid[0].length == 0) return 0;
        int rows = grid.length, cols = grid[0].length, islands = 0;
        boolean[][] seen = new boolean[rows][cols];
        int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
        Deque<Integer> queue = new ArrayDeque<>();
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
            if (grid[r][c] != '1' || seen[r][c]) continue;
            islands++;
            seen[r][c] = true;
            queue.offer(r * cols + c);
            while (!queue.isEmpty()) {
                int id = queue.poll(), x = id / cols, y = id % cols;
                for (int d = 0; d < 4; d++) {
                    int nx = x + dr[d], ny = y + dc[d];
                    if (nx >= 0 && nx < rows && ny >= 0 && ny < cols
                            && grid[nx][ny] == '1' && !seen[nx][ny]) {
                        seen[nx][ny] = true; // Mark on enqueue, not on dequeue.
                        queue.offer(nx * cols + ny);
                    }
                }
            }
        }
        return islands;
    }
    // #endregion islands

    // #region courses
    public static boolean canFinish(int n, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
        int[] indegree = new int[n];
        for (int[] edge : prerequisites) { graph.get(edge[1]).add(edge[0]); indegree[edge[0]]++; }
        Deque<Integer> queue = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indegree[i] == 0) queue.offer(i);
        int processed = 0;
        while (!queue.isEmpty()) {
            int node = queue.poll();
            processed++;
            for (int next : graph.get(node)) if (--indegree[next] == 0) queue.offer(next);
        }
        return processed == n;
    }
    // #endregion courses

    // #region provinces
    public static int findCircleNum(int[][] connected) {
        int n = connected.length, components = n;
        int[] parent = new int[n], size = new int[n];
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) {
            if (connected[i][j] == 0) continue;
            int a = findRoot(parent, i), b = findRoot(parent, j);
            if (a == b) continue;
            if (size[a] < size[b]) { int t = a; a = b; b = t; }
            parent[b] = a;
            size[a] += size[b];
            components--;
        }
        return components;
    }
    private static int findRoot(int[] parent, int x) {
        while (x != parent[x]) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    // #endregion provinces

    // #region permute
    public static List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        permuteDfs(nums, new boolean[nums.length], new ArrayList<>(), result);
        return result;
    }
    private static void permuteDfs(int[] nums, boolean[] used, List<Integer> path,
                                   List<List<Integer>> result) {
        if (path.size() == nums.length) { result.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            permuteDfs(nums, used, path, result);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
    // #endregion permute

    // #region subsets
    public static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        subsetDfs(nums, 0, new ArrayList<>(), result);
        return result;
    }
    private static void subsetDfs(int[] nums, int start, List<Integer> path,
                                  List<List<Integer>> result) {
        result.add(new ArrayList<>(path));
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            subsetDfs(nums, i + 1, path, result);
            path.remove(path.size() - 1);
        }
    }
    // #endregion subsets

    // #region generateParenthesis
    public static List<String> generateParenthesis(int n) {
        if (n < 0) throw new IllegalArgumentException("n must be nonnegative");
        List<String> result = new ArrayList<>();
        parenthesesDfs(n, 0, 0, new StringBuilder(), result);
        return result;
    }
    private static void parenthesesDfs(int n, int open, int close, StringBuilder path,
                                       List<String> result) {
        if (close == n) { result.add(path.toString()); return; }
        if (open < n) {
            path.append('(');
            parenthesesDfs(n, open + 1, close, path, result);
            path.setLength(path.length() - 1);
        }
        if (close < open) {
            path.append(')');
            parenthesesDfs(n, open, close + 1, path, result);
            path.setLength(path.length() - 1);
        }
    }
    // #endregion generateParenthesis

    // #region mergeIntervals
    public static int[][] merge(int[][] intervals) {
        if (intervals.length == 0) return new int[0][2];
        int[][] a = new int[intervals.length][];
        for (int i = 0; i < a.length; i++) a[i] = intervals[i].clone();
        Arrays.sort(a, (x, y) -> Integer.compare(x[0], y[0]));
        List<int[]> result = new ArrayList<>();
        for (int[] interval : a) {
            if (result.isEmpty() || result.get(result.size() - 1)[1] < interval[0]) result.add(interval);
            else {
                int[] last = result.get(result.size() - 1);
                last[1] = Math.max(last[1], interval[1]);
            }
        }
        return result.toArray(new int[result.size()][]);
    }
    // #endregion mergeIntervals

    // #region canJump
    public static boolean canJump(int[] nums) {
        long farthest = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > farthest) return false;
            farthest = Math.max(farthest, (long) i + nums[i]);
            if (farthest >= nums.length - 1) return true;
        }
        return false;
    }
    // #endregion canJump

    // #region maxProfit
    public static int maxProfit(int[] prices) {
        int minimum = Integer.MAX_VALUE, best = 0;
        for (int price : prices) {
            minimum = Math.min(minimum, price);
            best = Math.max(best, price - minimum);
        }
        return best;
    }
    // #endregion maxProfit

    // #region maxSubArray
    public static int maxSubArray(int[] nums) {
        if (nums.length == 0) throw new IllegalArgumentException("Nonempty input required");
        int end = nums[0], best = nums[0];
        for (int i = 1; i < nums.length; i++) {
            end = Math.max(nums[i], end + nums[i]);
            best = Math.max(best, end);
        }
        return best;
    }
    // #endregion maxSubArray

    // #region rob
    public static int rob(int[] nums) {
        int twoBack = 0, oneBack = 0;
        for (int value : nums) {
            int current = Math.max(oneBack, twoBack + value);
            twoBack = oneBack;
            oneBack = current;
        }
        return oneBack;
    }
    // #endregion rob

    // #region lis
    public static int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length];
        int size = 0;
        for (int value : nums) {
            int left = 0, right = size;
            while (left < right) {
                int mid = left + (right - left) / 2;
                if (tails[mid] < value) left = mid + 1;
                else right = mid;
            }
            tails[left] = value;
            if (left == size) size++;
        }
        return size;
    }
    // #endregion lis

    // #region lcs
    public static int longestCommonSubsequence(String a, String b) {
        int[] dp = new int[b.length() + 1];
        for (int i = 1; i <= a.length(); i++) {
            int diagonal = 0;
            for (int j = 1; j <= b.length(); j++) {
                int old = dp[j];
                if (a.charAt(i - 1) == b.charAt(j - 1)) dp[j] = diagonal + 1;
                else dp[j] = Math.max(dp[j], dp[j - 1]);
                diagonal = old;
            }
        }
        return dp[b.length()];
    }
    // #endregion lcs

    // #region coinChange
    public static int coinChange(int[] coins, int amount) {
        if (amount < 0) throw new IllegalArgumentException("Negative amount");
        for (int coin : coins) if (coin <= 0) throw new IllegalArgumentException("Nonpositive coin");
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int sum = 1; sum <= amount; sum++) {
            for (int coin : coins) {
                if (coin <= sum) dp[sum] = Math.min(dp[sum], dp[sum - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
    // #endregion coinChange

    // #region coinCombinations
    public static int change(int amount, int[] coins) {
        if (amount < 0) throw new IllegalArgumentException("Negative amount");
        Set<Integer> distinct = new HashSet<>();
        for (int coin : coins) {
            if (coin <= 0 || !distinct.add(coin)) throw new IllegalArgumentException("Coins must be positive and distinct");
        }
        // Exact intermediate counts: a small final answer need not imply small other states.
        BigInteger[] dp = new BigInteger[amount + 1];
        Arrays.fill(dp, BigInteger.ZERO);
        dp[0] = BigInteger.ONE;
        for (int coin : coins) {
            for (int sum = coin; sum <= amount; sum++) dp[sum] = dp[sum].add(dp[sum - coin]);
        }
        return dp[amount].intValueExact();
    }
    // #endregion coinCombinations

    // #region lru
    public static class LRUCache {
        private static class Node {
            int key, value;
            Node prev, next;
            Node(int key, int value) { this.key = key; this.value = value; }
        }
        private final int capacity;
        private final Map<Integer, Node> map = new HashMap<>();
        private final Node head = new Node(0, 0), tail = new Node(0, 0);
        public LRUCache(int capacity) {
            if (capacity < 0) throw new IllegalArgumentException("Negative capacity");
            this.capacity = capacity;
            head.next = tail;
            tail.prev = head;
        }
        public int get(int key) {
            Node node = map.get(key);
            if (node == null) return -1;
            unlink(node);
            addFirst(node);
            return node.value;
        }
        public void put(int key, int value) {
            if (capacity == 0) return;
            Node node = map.get(key);
            if (node != null) { node.value = value; unlink(node); addFirst(node); return; }
            node = new Node(key, value);
            map.put(key, node);
            addFirst(node);
            if (map.size() > capacity) {
                Node victim = tail.prev;
                unlink(victim);
                map.remove(victim.key);
            }
        }
        private void unlink(Node node) { node.prev.next = node.next; node.next.prev = node.prev; }
        private void addFirst(Node node) {
            node.prev = head;
            node.next = head.next;
            head.next.prev = node;
            head.next = node;
        }
    }
    // #endregion lru

    // #region singleNumber
    public static int singleNumber(int[] nums) {
        int result = 0;
        for (int value : nums) result ^= value;
        return result;
    }
    // #endregion singleNumber

    // #region mergeSort
    public static int[] sortArray(int[] nums) {
        int[] a = nums.clone();
        mergeSort(a, new int[a.length], 0, a.length);
        return a;
    }
    private static void mergeSort(int[] a, int[] buffer, int left, int right) {
        if (right - left <= 1) return;
        int mid = left + (right - left) / 2;
        mergeSort(a, buffer, left, mid);
        mergeSort(a, buffer, mid, right);
        int i = left, j = mid, k = left;
        while (i < mid && j < right) buffer[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i < mid) buffer[k++] = a[i++];
        while (j < right) buffer[k++] = a[j++];
        System.arraycopy(buffer, left, a, left, right - left);
    }
    // #endregion mergeSort
}
