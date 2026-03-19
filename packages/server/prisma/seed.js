// packages/server/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LevelUp database...');

  // ─── Clean slate ─────────────────────────────────────────────────────────
  await prisma.leaderboardEntry.deleteMany();
  await prisma.userSkillNode.deleteMany();
  await prisma.userQuestProgress.deleteMany();
  await prisma.dailyQuestLog.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.skillNode.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.world.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();

  // ─── Worlds ───────────────────────────────────────────────────────────────
  const worlds = await Promise.all([
    prisma.world.create({
      data: {
        slug: 'foundations',
        name: 'World 1: Foundations',
        description: 'Master the building blocks. Variables, loops, functions — the spells every engineer must know.',
        narrative: 'You arrive at the Gates of Logic, a vast stone archway humming with electric runes. The Keeper speaks: "Before you can forge systems, you must understand the atoms of code."',
        icon: '🌱',
        color: '#22C55E',
        unlockLevel: 1,
        order: 1,
      }
    }),
    prisma.world.create({
      data: {
        slug: 'core-engineering',
        name: 'World 2: Core Engineering',
        description: 'Data structures, algorithms, APIs. The real craft of software engineering begins here.',
        narrative: 'The Forge of Engineers rises before you — anvils of code, rivers of data. "Every great system," the Master says, "is built on structures that hold."',
        icon: '⚙️',
        color: '#3B82F6',
        unlockLevel: 5,
        order: 2,
      }
    }),
    prisma.world.create({
      data: {
        slug: 'advanced-systems',
        name: 'World 3: Advanced Systems',
        description: 'Databases, scaling, system design. Think like an architect, not just a coder.',
        narrative: 'The Architect\'s Citadel floats above the clouds. Here, engineers don\'t just write code — they design the invisible infrastructure that millions depend on.',
        icon: '🧠',
        color: '#8B5CF6',
        unlockLevel: 15,
        order: 3,
      }
    }),
    prisma.world.create({
      data: {
        slug: 'real-world',
        name: 'World 4: Real World Simulation',
        description: 'Full projects, debugging production systems, optimization under fire.',
        narrative: 'Welcome to The Crucible. No tutorials. No hints. Real deadlines, real stakes. Only engineers who\'ve mastered the previous worlds survive here.',
        icon: '🚀',
        color: '#F59E0B',
        unlockLevel: 30,
        order: 4,
      }
    }),
  ]);

  const [w1, w2, w3, w4] = worlds;
  console.log('✅ Worlds created');

  // ─── Problems ─────────────────────────────────────────────────────────────

  const problems = await Promise.all([
    // ── World 1 Problems ─────────────────────────────────────────────────
    prisma.problem.create({
      data: {
        title: 'Hello, Engineer',
        slug: 'hello-engineer',
        description: `## Hello, Engineer!\n\nEvery journey begins with a single line. Write a program that prints **"Hello, Engineer!"** to the console.\n\n### Input\nNone\n\n### Output\n\`Hello, Engineer!\`\n\n### Example\n\`\`\`\nOutput: Hello, Engineer!\n\`\`\``,
        type: 'CODING',
        difficulty: 'EASY',
        tags: JSON.stringify(['basics', 'output']),
        xpReward: 50,
        timeLimit: 10,
        order: 1,
        worldId: w1.id,
        starterCode: JSON.stringify({
          python: '# Write your solution here\n',
          java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}'
        }),
        solution: JSON.stringify({
          python: 'print("Hello, Engineer!")',
          java: 'public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello, Engineer!");\n    }\n}'
        }),
        testCases: JSON.stringify([
          { input: '', expectedOutput: 'Hello, Engineer!', isHidden: false },
        ]),
        constraints: 'Output must match exactly (case-sensitive)',
      }
    }),

    prisma.problem.create({
      data: {
        title: 'Sum of Two Numbers',
        slug: 'sum-two-numbers',
        description: `## Sum of Two Numbers\n\nGiven two integers **a** and **b**, return their sum.\n\n### Input\nTwo space-separated integers: \`a b\`\n\n### Output\nA single integer: the sum\n\n### Examples\n| Input | Output |\n|-------|--------|\n| 3 5 | 8 |\n| -1 7 | 6 |\n| 0 0 | 0 |`,
        type: 'CODING',
        difficulty: 'EASY',
        tags: JSON.stringify(['math', 'basics', 'variables']),
        xpReward: 75,
        timeLimit: 15,
        order: 2,
        worldId: w1.id,
        starterCode: JSON.stringify({
          python: 'a, b = map(int, input().split())\n# Your solution here\n',
          java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt();\n        // Your solution here\n    }\n}'
        }),
        solution: JSON.stringify({
          python: 'a, b = map(int, input().split())\nprint(a + b)',
          java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}'
        }),
        testCases: JSON.stringify([
          { input: '3 5', expectedOutput: '8', isHidden: false },
          { input: '-1 7', expectedOutput: '6', isHidden: false },
          { input: '0 0', expectedOutput: '0', isHidden: false },
          { input: '100 200', expectedOutput: '300', isHidden: true },
          { input: '-50 -30', expectedOutput: '-80', isHidden: true },
        ]),
        constraints: '−10^9 ≤ a, b ≤ 10^9',
      }
    }),

    prisma.problem.create({
      data: {
        title: 'FizzBuzz Classic',
        slug: 'fizzbuzz-classic',
        description: `## FizzBuzz Classic\n\nA rite of passage. Print numbers 1 through **n**, but:\n- For multiples of **3**, print \`Fizz\`\n- For multiples of **5**, print \`Buzz\`\n- For multiples of **both 3 and 5**, print \`FizzBuzz\`\n\n### Input\nA single integer \`n\`\n\n### Output\nn lines`,
        type: 'CODING',
        difficulty: 'EASY',
        tags: JSON.stringify(['loops', 'conditionals', 'classic']),
        xpReward: 100,
        timeLimit: 20,
        order: 3,
        worldId: w1.id,
        starterCode: JSON.stringify({
          python: 'n = int(input())\n# Your solution here\n',
          java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Your solution here\n    }\n}'
        }),
        solution: JSON.stringify({
          python: 'n = int(input())\nfor i in range(1, n+1):\n    if i % 15 == 0: print("FizzBuzz")\n    elif i % 3 == 0: print("Fizz")\n    elif i % 5 == 0: print("Buzz")\n    else: print(i)',
          java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        for(int i=1;i<=n;i++){\n            if(i%15==0) System.out.println("FizzBuzz");\n            else if(i%3==0) System.out.println("Fizz");\n            else if(i%5==0) System.out.println("Buzz");\n            else System.out.println(i);\n        }\n    }\n}'
        }),
        testCases: JSON.stringify([
          { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isHidden: false },
          { input: '3', expectedOutput: '1\n2\nFizz', isHidden: false },
          { input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz', isHidden: true },
        ]),
        constraints: '1 ≤ n ≤ 10^4',
      }
    }),

    prisma.problem.create({
      data: {
        title: 'What is a Variable?',
        slug: 'what-is-variable-mcq',
        description: `## What is a Variable?\n\nTest your understanding of fundamental programming concepts.`,
        type: 'MCQ',
        difficulty: 'EASY',
        tags: JSON.stringify(['theory', 'basics', 'concepts']),
        xpReward: 40,
        timeLimit: 5,
        order: 4,
        worldId: w1.id,
        mcqOptions: JSON.stringify([
          { id: 'a', text: 'A fixed value that cannot be changed during execution', isCorrect: false },
          { id: 'b', text: 'A named storage location whose value can change during execution', isCorrect: true },
          { id: 'c', text: 'A function that returns a value', isCorrect: false },
          { id: 'd', text: 'A type of loop that iterates over values', isCorrect: false },
        ]),
        mcqExplanation: 'A variable is a named container in memory that stores a value which can be modified during program execution. Unlike constants, variables are mutable.',
      }
    }),

    prisma.problem.create({
      data: {
        title: 'Debug the Loop',
        slug: 'debug-the-loop',
        description: `## Debug the Loop\n\nThis code should print the sum of all even numbers from 1 to n, but it has **2 bugs**. Find and fix them.\n\n### Expected behavior\nFor input \`10\`, output should be \`30\` (2+4+6+8+10)`,
        type: 'DEBUGGING',
        difficulty: 'EASY',
        tags: JSON.stringify(['debugging', 'loops', 'conditionals']),
        xpReward: 120,
        timeLimit: 20,
        order: 5,
        worldId: w1.id,
        buggyCode: JSON.stringify({
          python: 'n = int(input())\ntotal = 0\nfor i in range(1, n):  # Bug 1: should include n\n    if i % 2 == 1:  # Bug 2: should be == 0 for even\n        total += i\nprint(total)',
          java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int total = 0;\n        for(int i=1; i<n; i++) { // Bug 1: should be i<=n\n            if(i % 2 == 1) { // Bug 2: should be == 0\n                total += i;\n            }\n        }\n        System.out.println(total);\n    }\n}'
        }),
        solution: JSON.stringify({
          python: 'n = int(input())\ntotal = 0\nfor i in range(1, n+1):\n    if i % 2 == 0:\n        total += i\nprint(total)',
          java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int total = 0;\n        for(int i=1; i<=n; i++) {\n            if(i % 2 == 0) {\n                total += i;\n            }\n        }\n        System.out.println(total);\n    }\n}'
        }),
        testCases: JSON.stringify([
          { input: '10', expectedOutput: '30', isHidden: false },
          { input: '4', expectedOutput: '6', isHidden: false },
          { input: '1', expectedOutput: '0', isHidden: true },
        ]),
        constraints: '1 ≤ n ≤ 1000',
      }
    }),

    // ── World 2 Problems ─────────────────────────────────────────────────
    prisma.problem.create({
      data: {
        title: 'Reverse a String',
        slug: 'reverse-string',
        description: `## Reverse a String\n\nGiven a string **s**, return it reversed.\n\n### Examples\n| Input | Output |\n|-------|--------|\n| hello | olleh |\n| engineer | reenignee |\n| ab | ba |`,
        type: 'CODING',
        difficulty: 'EASY',
        tags: JSON.stringify(['strings', 'arrays']),
        xpReward: 100,
        timeLimit: 20,
        order: 1,
        worldId: w2.id,
        starterCode: JSON.stringify({
          python: 's = input()\n# Your solution here\n',
          java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        // Your solution here\n    }\n}'
        }),
        solution: JSON.stringify({
          python: 's = input()\nprint(s[::-1])',
          java: 'import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        System.out.println(new StringBuilder(s).reverse().toString());\n    }\n}'
        }),
        testCases: JSON.stringify([
          { input: 'hello', expectedOutput: 'olleh', isHidden: false },
          { input: 'engineer', expectedOutput: 'reenignee', isHidden: false },
          { input: 'ab', expectedOutput: 'ba', isHidden: true },
          { input: 'a', expectedOutput: 'a', isHidden: true },
        ]),
        constraints: '1 ≤ |s| ≤ 10^5',
      }
    }),

    prisma.problem.create({
      data: {
        title: 'Two Sum',
        slug: 'two-sum',
        description: `## Two Sum\n\nGiven an array of integers **nums** and a target integer **target**, return the indices of the two numbers that add up to the target.\n\nAssume exactly one solution exists. You may not use the same element twice.\n\n### Input\n- Line 1: Space-separated integers (the array)\n- Line 2: The target integer\n\n### Output\nTwo space-separated indices (0-based)\n\n### Examples\n| nums | target | Output |\n|------|--------|--------|\n| 2 7 11 15 | 9 | 0 1 |\n| 3 2 4 | 6 | 1 2 |`,
        type: 'CODING',
        difficulty: 'MEDIUM',
        tags: JSON.stringify(['arrays', 'hash-map', 'classic']),
        xpReward: 200,
        timeLimit: 30,
        order: 2,
        worldId: w2.id,
        starterCode: JSON.stringify({
          python: 'nums = list(map(int, input().split()))\ntarget = int(input())\n# Your solution here\n',
          java: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(" ");\n        int[] nums = new int[parts.length];\n        for(int i=0;i<parts.length;i++) nums[i]=Integer.parseInt(parts[i]);\n        int target = sc.nextInt();\n        // Your solution here\n    }\n}'
        }),
        solution: JSON.stringify({
          python: 'nums = list(map(int, input().split()))\ntarget = int(input())\nseen = {}\nfor i, n in enumerate(nums):\n    if target - n in seen:\n        print(seen[target-n], i)\n        break\n    seen[n] = i',
          java: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(" ");\n        int[] nums = new int[parts.length];\n        for(int i=0;i<parts.length;i++) nums[i]=Integer.parseInt(parts[i]);\n        int target = sc.nextInt();\n        Map<Integer,Integer> map = new HashMap<>();\n        for(int i=0;i<nums.length;i++){\n            int comp = target-nums[i];\n            if(map.containsKey(comp)){System.out.println(map.get(comp)+" "+i);return;}\n            map.put(nums[i],i);\n        }\n    }\n}'
        }),
        testCases: JSON.stringify([
          { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
          { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false },
          { input: '3 3\n6', expectedOutput: '0 1', isHidden: true },
        ]),
        constraints: '2 ≤ nums.length ≤ 10^4\n−10^9 ≤ nums[i] ≤ 10^9',
      }
    }),

    prisma.problem.create({
      data: {
        title: 'Valid Parentheses',
        slug: 'valid-parentheses',
        description: `## Valid Parentheses\n\nGiven a string **s** containing only \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, \`]\`, determine if the input string is valid.\n\nA string is valid if:\n1. Open brackets are closed by the same type\n2. Open brackets are closed in correct order\n3. Every close bracket has a corresponding open bracket\n\n### Examples\n| Input | Output |\n|-------|--------|\n| () | true |\n| ()[]{} | true |\n| (] | false |\n| ([)] | false |`,
        type: 'CODING',
        difficulty: 'MEDIUM',
        tags: JSON.stringify(['stack', 'strings', 'classic']),
        xpReward: 200,
        timeLimit: 30,
        order: 3,
        worldId: w2.id,
        starterCode: JSON.stringify({
          python: 's = input()\n# Your solution here\n',
          java: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        // Your solution here\n    }\n}'
        }),
        solution: JSON.stringify({
          python: 's = input()\nstack = []\npairs = {")":"(", "}":"{", "]":"["}\nfor c in s:\n    if c in "({[": stack.append(c)\n    elif not stack or stack[-1] != pairs[c]: print("false"); exit()\n    else: stack.pop()\nprint("true" if not stack else "false")',
        }),
        testCases: JSON.stringify([
          { input: '()', expectedOutput: 'true', isHidden: false },
          { input: '()[]{', expectedOutput: 'false', isHidden: false },
          { input: '(]', expectedOutput: 'false', isHidden: false },
          { input: '()[]{}}', expectedOutput: 'false', isHidden: true },
        ]),
        constraints: '1 ≤ s.length ≤ 10^4',
      }
    }),

    prisma.problem.create({
      data: {
        title: 'Binary Search',
        slug: 'binary-search',
        description: `## Binary Search\n\nGiven a **sorted** array of integers and a target value, return the index of target using binary search. Return \`-1\` if not found.\n\n### Input\n- Line 1: Space-separated sorted integers\n- Line 2: Target integer\n\n### Output\nIndex of target or -1`,
        type: 'CODING',
        difficulty: 'MEDIUM',
        tags: JSON.stringify(['binary-search', 'arrays', 'algorithms']),
        xpReward: 175,
        timeLimit: 25,
        order: 4,
        worldId: w2.id,
        starterCode: JSON.stringify({
          python: 'nums = list(map(int, input().split()))\ntarget = int(input())\n# Implement binary search — O(log n)\n',
          java: 'import java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(" ");\n        int[] nums = Arrays.stream(parts).mapToInt(Integer::parseInt).toArray();\n        int target = sc.nextInt();\n        // Implement binary search\n    }\n}'
        }),
        solution: JSON.stringify({
          python: 'nums = list(map(int, input().split()))\ntarget = int(input())\nlo, hi = 0, len(nums)-1\nwhile lo <= hi:\n    mid = (lo+hi)//2\n    if nums[mid] == target: print(mid); exit()\n    elif nums[mid] < target: lo = mid+1\n    else: hi = mid-1\nprint(-1)',
        }),
        testCases: JSON.stringify([
          { input: '-1 0 3 5 9 12\n9', expectedOutput: '4', isHidden: false },
          { input: '-1 0 3 5 9 12\n2', expectedOutput: '-1', isHidden: false },
          { input: '5\n5', expectedOutput: '0', isHidden: true },
        ]),
        constraints: '1 ≤ nums.length ≤ 10^4\nAll elements are unique\nArray is sorted in ascending order',
      }
    }),

    // ── World 3 Problems ─────────────────────────────────────────────────
    prisma.problem.create({
      data: {
        title: 'LRU Cache',
        slug: 'lru-cache',
        description: `## LRU Cache\n\nDesign a data structure that follows the **Least Recently Used (LRU)** cache eviction policy.\n\nImplement \`LRUCache\` with:\n- \`get(key)\`: Return the value or -1\n- \`put(key, value)\`: Insert/update. If at capacity, evict the LRU item.\n\n### Input\nLine 1: capacity\nFollowing lines: \`GET key\` or \`PUT key value\`\n\n### Output\nOutput of each GET operation`,
        type: 'CODING',
        difficulty: 'HARD',
        tags: JSON.stringify(['design', 'hash-map', 'linked-list', 'classic']),
        xpReward: 400,
        timeLimit: 45,
        order: 1,
        worldId: w3.id,
        starterCode: JSON.stringify({
          python: '# Implement LRU Cache\nimport sys\nfrom collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        pass\n    \n    def get(self, key):\n        pass\n    \n    def put(self, key, value):\n        pass\n',
        }),
        solution: JSON.stringify({
          python: 'from collections import OrderedDict\nimport sys\n\nclass LRUCache:\n    def __init__(self, cap):\n        self.cap = cap\n        self.cache = OrderedDict()\n    def get(self, key):\n        if key not in self.cache: return -1\n        self.cache.move_to_end(key)\n        return self.cache[key]\n    def put(self, key, val):\n        if key in self.cache: self.cache.move_to_end(key)\n        self.cache[key] = val\n        if len(self.cache) > self.cap: self.cache.popitem(last=False)\n\nlines = sys.stdin.read().split("\\n")\ncache = LRUCache(int(lines[0]))\nfor line in lines[1:]:\n    if not line.strip(): continue\n    parts = line.split()\n    if parts[0] == "GET": print(cache.get(int(parts[1])))\n    else: cache.put(int(parts[1]), int(parts[2]))',
        }),
        testCases: JSON.stringify([
          { input: '2\nPUT 1 1\nPUT 2 2\nGET 1\nPUT 3 3\nGET 2\nPUT 4 4\nGET 1\nGET 3\nGET 4', expectedOutput: '1\n-1\n-1\n3\n4', isHidden: false },
        ]),
        constraints: '1 ≤ capacity ≤ 3000',
      }
    }),

    prisma.problem.create({
      data: {
        title: 'System Design: Rate Limiter',
        slug: 'system-design-rate-limiter',
        description: `## System Design: Rate Limiter\n\nDesign a **token bucket rate limiter** that allows at most **N requests per window**.\n\nGiven a sequence of request timestamps, determine which requests are **ALLOWED** or **DENIED**.\n\n### Input\n- Line 1: \`limit window_ms\` (max requests, time window in ms)\n- Following lines: timestamps in ms\n\n### Output\nALLOWED or DENIED for each request`,
        type: 'CODING',
        difficulty: 'HARD',
        tags: JSON.stringify(['system-design', 'algorithms', 'rate-limiting']),
        xpReward: 450,
        timeLimit: 40,
        order: 2,
        worldId: w3.id,
        starterCode: JSON.stringify({
          python: 'import sys\nfrom collections import deque\n\nlines = sys.stdin.read().strip().split("\\n")\nlimit, window = map(int, lines[0].split())\n\n# Implement sliding window rate limiter\nwindow_queue = deque()\nfor line in lines[1:]:\n    ts = int(line)\n    # Your logic here\n',
        }),
        solution: JSON.stringify({
          python: 'import sys\nfrom collections import deque\n\nlines = sys.stdin.read().strip().split("\\n")\nlimit, window = map(int, lines[0].split())\nq = deque()\nfor line in lines[1:]:\n    ts = int(line.strip())\n    while q and ts - q[0] >= window: q.popleft()\n    if len(q) < limit:\n        q.append(ts)\n        print("ALLOWED")\n    else:\n        print("DENIED")',
        }),
        testCases: JSON.stringify([
          { input: '3 1000\n0\n200\n400\n600\n800\n1200', expectedOutput: 'ALLOWED\nALLOWED\nALLOWED\nDENIED\nDENIED\nALLOWED', isHidden: false },
        ]),
        constraints: '1 ≤ limit ≤ 100\n1 ≤ window ≤ 60000ms',
      }
    }),

    prisma.problem.create({
      data: {
        title: 'Database Concepts: Indexing',
        slug: 'db-indexing-mcq',
        description: `## Database Concepts: Indexing\n\nTest your knowledge of database indexing strategies.`,
        type: 'MCQ',
        difficulty: 'MEDIUM',
        tags: JSON.stringify(['databases', 'indexing', 'theory']),
        xpReward: 80,
        timeLimit: 8,
        order: 3,
        worldId: w3.id,
        mcqOptions: JSON.stringify([
          { id: 'a', text: 'Indexes always speed up both SELECT and INSERT operations', isCorrect: false },
          { id: 'b', text: 'A B-tree index is best for range queries; a hash index is best for equality lookups', isCorrect: true },
          { id: 'c', text: 'Creating more indexes always improves database performance', isCorrect: false },
          { id: 'd', text: 'Primary keys do not require an index', isCorrect: false },
        ]),
        mcqExplanation: 'B-tree indexes support range queries efficiently due to their sorted structure. Hash indexes are O(1) for equality but cannot handle ranges. More indexes slow down writes. Primary keys always have an implicit unique index.',
      }
    }),

    // ── World 4 Problems ─────────────────────────────────────────────────
    prisma.problem.create({
      data: {
        title: 'Build a REST API Router',
        slug: 'build-rest-router',
        description: `## Build a REST API Router (Boss Fight)\n\nImplement a simple HTTP router that matches paths and methods.\n\nGiven route registrations and incoming requests, output which handler matches or \`404\` if none.\n\n### Input\n- Lines starting with \`REGISTER method path\`\n- Lines starting with \`REQUEST method path\`\n\n### Output\nFor each REQUEST: the registered handler path or "404"`,
        type: 'CODING',
        difficulty: 'BOSS',
        tags: JSON.stringify(['system-design', 'strings', 'routing', 'backend']),
        xpReward: 800,
        timeLimit: 60,
        order: 1,
        worldId: w4.id,
        starterCode: JSON.stringify({
          python: 'import sys\n\nlines = sys.stdin.read().strip().split("\\n")\nroutes = {}\n\nfor line in lines:\n    parts = line.split()\n    if parts[0] == "REGISTER":\n        method, path = parts[1], parts[2]\n        # Register the route\n        pass\n    elif parts[0] == "REQUEST":\n        method, path = parts[1], parts[2]\n        # Match the route\n        pass\n',
        }),
        solution: JSON.stringify({
          python: 'import sys\n\nlines = sys.stdin.read().strip().split("\\n")\nroutes = {}\n\nfor line in lines:\n    parts = line.split()\n    if parts[0] == "REGISTER":\n        key = (parts[1].upper(), parts[2])\n        routes[key] = parts[2]\n    elif parts[0] == "REQUEST":\n        key = (parts[1].upper(), parts[2])\n        print(routes.get(key, "404"))',
        }),
        testCases: JSON.stringify([
          { input: 'REGISTER GET /users\nREGISTER POST /users\nREGISTER GET /users/:id\nREQUEST GET /users\nREQUEST POST /users\nREQUEST DELETE /users\nREQUEST GET /users/:id', expectedOutput: '/users\n/users\n404\n/users/:id', isHidden: false },
        ]),
        constraints: 'Up to 100 routes\nPaths are case-sensitive\nMethods are case-insensitive',
      }
    }),
  ]);

  console.log(`✅ ${problems.length} Problems created`);

  // ─── Quests ───────────────────────────────────────────────────────────────

  const quests = await Promise.all([
    // World 1 Quests
    prisma.quest.create({ data: { title: 'First Steps', description: 'Complete your first coding problem and begin your engineering journey.', narrative: 'The Keeper hands you a glowing scroll. "Solve this, and the gates open."', type: 'STORY', difficulty: 'EASY', xpReward: 100, coinReward: 50, order: 1, worldId: w1.id, problemId: problems[0].id, unlockLevel: 1 } }),
    prisma.quest.create({ data: { title: 'The Adder', description: 'Master basic arithmetic operations.', narrative: 'The ancient calculator hums. Feed it numbers, and it reveals truths.', type: 'STORY', difficulty: 'EASY', xpReward: 150, coinReward: 75, order: 2, worldId: w1.id, problemId: problems[1].id, unlockLevel: 1 } }),
    prisma.quest.create({ data: { title: 'The FizzBuzz Trial', description: 'Prove your loop mastery with the ancient FizzBuzz ritual.', narrative: 'Every guild requires initiates to pass the FizzBuzz Trial. None may advance without it.', type: 'STORY', difficulty: 'EASY', xpReward: 200, coinReward: 100, order: 3, worldId: w1.id, problemId: problems[2].id, unlockLevel: 2 } }),
    prisma.quest.create({ data: { title: 'Theory Check', description: 'Prove your conceptual understanding with an MCQ challenge.', narrative: 'The sage tests not just your hands, but your mind.', type: 'STORY', difficulty: 'EASY', xpReward: 80, coinReward: 40, order: 4, worldId: w1.id, problemId: problems[3].id, unlockLevel: 2 } }),
    prisma.quest.create({ data: { title: 'Bug Hunter I', description: 'Find and fix the bugs lurking in corrupted code.', narrative: 'A cursed scroll has been corrupted. Restore it to its true form.', type: 'STORY', difficulty: 'EASY', xpReward: 175, coinReward: 90, order: 5, worldId: w1.id, problemId: problems[4].id, unlockLevel: 3 } }),
    prisma.quest.create({ data: { title: 'Daily Grind I', description: 'Complete 2 problems today to maintain your streak.', narrative: '"Consistency," the master says, "is the rarest superpower."', type: 'DAILY', difficulty: 'EASY', xpReward: 120, coinReward: 60, order: 10, worldId: w1.id, unlockLevel: 1 } }),
    prisma.quest.create({ data: { title: 'Boss Fight: The Compiler', description: 'Defeat the World 1 boss — solve all 5 foundation problems without errors.', narrative: 'The Compiler Dragon awakens. It speaks only in syntax errors. Face it.', type: 'BOSS', difficulty: 'MEDIUM', xpReward: 500, coinReward: 250, order: 99, worldId: w1.id, unlockLevel: 4 } }),

    // World 2 Quests
    prisma.quest.create({ data: { title: 'String Sorcerer', description: 'Master string manipulation — reverse, search, transform.', narrative: 'Words have power. The String Sorcerer knows how to wield them.', type: 'STORY', difficulty: 'EASY', xpReward: 150, coinReward: 75, order: 1, worldId: w2.id, problemId: problems[5].id, unlockLevel: 5 } }),
    prisma.quest.create({ data: { title: 'The Two Sum Duel', description: 'Solve the legendary Two Sum with optimal O(n) complexity.', narrative: '"Can you find the pair?" the Merchant asks, tossing you a bag of numbers.', type: 'STORY', difficulty: 'MEDIUM', xpReward: 300, coinReward: 150, order: 2, worldId: w2.id, problemId: problems[6].id, unlockLevel: 5 } }),
    prisma.quest.create({ data: { title: 'The Stack Speaks', description: 'Use a stack to validate balanced brackets.', narrative: 'The ancient Gates of Parentheses will open only for those who understand balance.', type: 'STORY', difficulty: 'MEDIUM', xpReward: 300, coinReward: 150, order: 3, worldId: w2.id, problemId: problems[7].id, unlockLevel: 6 } }),
    prisma.quest.create({ data: { title: 'Binary Oracle', description: 'Search sorted arrays in logarithmic time.', narrative: 'The Oracle knows where everything is — but it only deals in halves.', type: 'STORY', difficulty: 'MEDIUM', xpReward: 250, coinReward: 125, order: 4, worldId: w2.id, problemId: problems[8].id, unlockLevel: 7 } }),
    prisma.quest.create({ data: { title: 'Daily Grind II', description: 'Solve 1 MEDIUM problem today.', narrative: 'The forge demands daily heat.', type: 'DAILY', difficulty: 'MEDIUM', xpReward: 200, coinReward: 100, order: 10, worldId: w2.id, unlockLevel: 5 } }),
    prisma.quest.create({ data: { title: 'Boss Fight: The Algorithm Sphinx', description: 'Answer the Sphinx\'s 3 algorithmic challenges to unlock World 3.', narrative: 'The Sphinx blocks the bridge to Advanced Systems. Answer in code, not words.', type: 'BOSS', difficulty: 'HARD', xpReward: 800, coinReward: 400, order: 99, worldId: w2.id, unlockLevel: 10 } }),

    // World 3 Quests
    prisma.quest.create({ data: { title: 'Cache Master', description: 'Implement the legendary LRU Cache — used in every production system.', narrative: 'Memory is limited. The Archivist teaches you the art of forgetting wisely.', type: 'STORY', difficulty: 'HARD', xpReward: 500, coinReward: 250, order: 1, worldId: w3.id, problemId: problems[9].id, unlockLevel: 15 } }),
    prisma.quest.create({ data: { title: 'The Rate Limiter', description: 'Protect systems from overload with a sliding window rate limiter.', narrative: 'The castle gates must not open for everyone at once. Design the control.', type: 'STORY', difficulty: 'HARD', xpReward: 550, coinReward: 275, order: 2, worldId: w3.id, problemId: problems[10].id, unlockLevel: 16 } }),
    prisma.quest.create({ data: { title: 'DB Theory Test', description: 'Prove your database knowledge.', narrative: 'The DBA elder quizzes you before granting access to the sacred schemas.', type: 'STORY', difficulty: 'MEDIUM', xpReward: 120, coinReward: 60, order: 3, worldId: w3.id, problemId: problems[11].id, unlockLevel: 15 } }),

    // World 4 Quests
    prisma.quest.create({ data: { title: 'Build the Router', description: 'Implement a production REST API router — the final boss challenge.', narrative: 'The Great System speaks: "Build my nervous system. Build my router. Or fall."', type: 'BOSS', difficulty: 'BOSS', xpReward: 1000, coinReward: 500, order: 1, worldId: w4.id, problemId: problems[12].id, unlockLevel: 30 } }),
    prisma.quest.create({ data: { title: 'Daily Grind: Elite', description: 'Solve a HARD problem before midnight.', narrative: 'Elite engineers show up every day.', type: 'DAILY', difficulty: 'HARD', xpReward: 400, coinReward: 200, order: 10, worldId: w4.id, unlockLevel: 25 } }),
  ]);

  console.log(`✅ ${quests.length} Quests created`);

  // ─── Skill Nodes ──────────────────────────────────────────────────────────

  const skillNodes = await Promise.all([
    // DSA track
    prisma.skillNode.create({ data: { name: 'Variables & Types', description: 'Primitive data types, type system basics', icon: '📦', category: 'DSA', xPosition: 100, yPosition: 50, unlockXP: 0, color: '#22C55E', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'Loops & Conditionals', description: 'Control flow mastery', icon: '🔄', category: 'DSA', xPosition: 100, yPosition: 150, unlockXP: 200, color: '#22C55E', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'Functions', description: 'Reusable code, scope, closures', icon: 'ƒ', category: 'DSA', xPosition: 100, yPosition: 250, unlockXP: 400, color: '#22C55E', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'Arrays & Strings', description: 'Linear data structures', icon: '📋', category: 'DSA', xPosition: 250, yPosition: 150, unlockXP: 500, color: '#3B82F6', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'Hash Maps', description: 'O(1) lookup, frequency counting', icon: '#️⃣', category: 'DSA', xPosition: 400, yPosition: 100, unlockXP: 800, color: '#3B82F6', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'Stacks & Queues', description: 'LIFO/FIFO data structures', icon: '📚', category: 'DSA', xPosition: 400, yPosition: 200, unlockXP: 900, color: '#3B82F6', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'Binary Search', description: 'O(log n) search on sorted data', icon: '🔍', category: 'DSA', xPosition: 550, yPosition: 100, unlockXP: 1200, color: '#8B5CF6', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'Trees & Graphs', description: 'Hierarchical and network structures', icon: '🌳', category: 'DSA', xPosition: 550, yPosition: 250, unlockXP: 2000, color: '#8B5CF6', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'Dynamic Programming', description: 'Memoization and tabulation', icon: '⚡', category: 'DSA', xPosition: 700, yPosition: 150, unlockXP: 3000, color: '#F59E0B', prerequisites: '[]' } }),
    // Backend track
    prisma.skillNode.create({ data: { name: 'HTTP & REST', description: 'Request/response cycle, REST principles', icon: '🌐', category: 'BACKEND', xPosition: 100, yPosition: 400, unlockXP: 600, color: '#22C55E', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'Databases', description: 'SQL, indexing, transactions', icon: '🗄️', category: 'BACKEND', xPosition: 300, yPosition: 400, unlockXP: 1500, color: '#3B82F6', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'Auth & Security', description: 'JWT, OAuth, bcrypt, HTTPS', icon: '🔐', category: 'BACKEND', xPosition: 500, yPosition: 400, unlockXP: 2500, color: '#8B5CF6', prerequisites: '[]' } }),
    prisma.skillNode.create({ data: { name: 'System Design', description: 'Scalability, caching, load balancing', icon: '🏗️', category: 'BACKEND', xPosition: 700, yPosition: 400, unlockXP: 4000, color: '#F59E0B', prerequisites: '[]' } }),
  ]);

  console.log(`✅ ${skillNodes.length} Skill nodes created`);

  // ─── Demo Users ───────────────────────────────────────────────────────────

  const adminHash = await bcrypt.hash('admin123', 12);
  const userHash = await bcrypt.hash('demo123', 12);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@levelup.dev',
      passwordHash: adminHash,
      role: 'ADMIN',
      xp: 9999,
      level: 50,
      coins: 9999,
      streak: 30,
      onboardingDone: true,
      selectedPath: 'DSA',
      skillLevel: 'ADVANCED',
      currentWorldId: w4.id,
    }
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo Engineer',
      email: 'demo@levelup.dev',
      passwordHash: userHash,
      role: 'USER',
      xp: 1250,
      level: 5,
      coins: 420,
      streak: 7,
      onboardingDone: true,
      selectedPath: 'DSA',
      skillLevel: 'INTERMEDIATE',
      dailyGoalHours: 2,
      currentWorldId: w1.id,
    }
  });

  // Leaderboard entries for demo users
  await prisma.leaderboardEntry.createMany({
    data: [
      { userId: adminUser.id, rank: 1, xp: 9999, level: 50, streak: 30 },
      { userId: demoUser.id, rank: 2, xp: 1250, level: 5, streak: 7 },
    ]
  });

  // Give demo user some quest progress
  await prisma.userQuestProgress.createMany({
    data: [
      { userId: demoUser.id, questId: quests[0].id, completed: true, completedAt: new Date(), attempts: 1 },
      { userId: demoUser.id, questId: quests[1].id, completed: true, completedAt: new Date(), attempts: 2 },
      { userId: demoUser.id, questId: quests[2].id, completed: false, attempts: 1 },
    ]
  });

  // Give demo user some skill nodes
  await prisma.userSkillNode.createMany({
    data: [
      { userId: demoUser.id, skillNodeId: skillNodes[0].id, unlocked: true, unlockedAt: new Date() },
      { userId: demoUser.id, skillNodeId: skillNodes[1].id, unlocked: true, unlockedAt: new Date() },
      { userId: demoUser.id, skillNodeId: skillNodes[2].id, unlocked: false },
    ]
  });

  // Announcement
  await prisma.announcement.create({
    data: {
      title: '🚀 Welcome to LevelUp Beta!',
      body: 'New worlds and problems are added weekly. Complete quests to climb the leaderboard.',
      type: 'INFO',
      isActive: true,
    }
  });

  console.log('✅ Demo users + leaderboard created');
  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────');
  console.log('Admin:  admin@levelup.dev / admin123');
  console.log('Demo:   demo@levelup.dev  / demo123');
  console.log('─────────────────────────────────────');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
