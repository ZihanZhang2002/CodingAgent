import { DemoTask, FileNode } from '../types';

const OFF_BY_ONE_FILES: FileNode = {
  name: 'root',
  type: 'folder',
  children: [
    {
      name: 'utils.py',
      type: 'file',
      language: 'python',
      content: `def get_average(numbers):
    if not numbers:
        return 0
    total = 0
    # BUG: Iterating one index too far
    for i in range(len(numbers) + 1):
        total += numbers[i]
    return total / len(numbers)`
    },
    {
      name: 'test_utils.py',
      type: 'file',
      language: 'python',
      content: `import utils
try:
    print("Testing get_average([10, 20, 30])...")
    result = utils.get_average([10, 20, 30])
    print(f"Result: {result}")
    assert result == 20
    print("Test Passed!")
except IndexError as e:
    print(f"Test Failed: IndexError - {e}")
except Exception as e:
    print(f"Test Failed: {e}")`
    }
  ]
};

const CLI_ARG_FILES: FileNode = {
  name: 'root',
  type: 'folder',
  children: [
    {
      name: 'greet.py',
      type: 'file',
      language: 'python',
      content: `import sys

def main():
    # BUG: Hardcoded name, ignores CLI args
    name = "World"
    print(f"Hello, {name}!")

if __name__ == "__main__":
    main()`
    }
  ]
};

const MATH_SOLVER_FILES: FileNode = {
    name: 'root',
    type: 'folder',
    children: [
        {
            name: 'solver.py',
            type: 'file',
            language: 'python',
            content: `def solve_quadratic(a, b, c):
    # Should return roots of ax^2 + bx + c = 0
    # BUG: Logic is completely missing, just returns None
    pass

if __name__ == "__main__":
    print("Solving x^2 - 3x + 2 = 0")
    print(solve_quadratic(1, -3, 2))`
        }
    ]
}

export const DEMO_TASKS: DemoTask[] = [
  {
    id: 'task-1',
    title: 'Fix Off-By-One Error',
    description: 'The average calculation crashes due to an index out of bounds error in the loop range.',
    difficulty: 'Easy',
    files: OFF_BY_ONE_FILES,
    initialCommand: 'python test_utils.py',
    userPrompt: 'The test_utils.py script is failing with an IndexError. Please fix the off-by-one error in utils.py.'
  },
  {
    id: 'task-2',
    title: 'Add CLI Argument Support',
    description: 'Modify the script to accept a name as a command-line argument instead of hardcoding "World".',
    difficulty: 'Medium',
    files: CLI_ARG_FILES,
    initialCommand: 'python greet.py Alice',
    userPrompt: 'Update greet.py to accept a name as a command-line argument. If provided, greet that name; otherwise default to "World".'
  },
  {
      id: 'task-3',
      title: 'Implement Math Logic',
      description: 'Implement the quadratic formula in a stubbed function.',
      difficulty: 'Hard',
      files: MATH_SOLVER_FILES,
      initialCommand: 'python solver.py',
      userPrompt: 'Implement the solve_quadratic function using the quadratic formula. Return the two roots as a tuple.'
  }
];