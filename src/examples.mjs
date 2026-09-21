export const examples=[
{name:'Array sum',desc:'Watch a loop turn numbers into a total.',code:`// A little code. A lot happening underneath.
const numbers = [2, 4, 6, 8];
let total = 0;

function sumArray(items) {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum = sum + items[i];
  }
  return sum;
}

total = sumArray(numbers);
console.log("Total:", total);`},
{name:'Recursive factorial',desc:'Follow nested calls and return values.',code:`function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}
const result = factorial(5);
console.log(result);`},
{name:'Shared references',desc:'Two names, one object.',code:`const original = { score: 10, name: "Ada" };
const alias = original;
alias.score = 25;
const scores = [10, 20];
scores.push(original.score);
console.log(original.score);
console.log(scores);`},
{name:'Trapping rain water',desc:'Two pointers with ten test cases.',code:`function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (left < right) {
    if (height[left] <= height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water = water + leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water = water + rightMax - height[right];
      }
      right--;
    }
  }
  return water;
}

console.log("Test 1:", trap([4, 2, 0, 3, 2, 5]));
console.log("Test 2:", trap([3, 0, 3]));
console.log("Test 3:", trap([1, 2, 3]));
console.log("Test 4:", trap([]));
console.log("Test 5:", trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]));
console.log("Test 6:", trap([5]));
console.log("Test 7:", trap([5, 4, 3, 2, 1]));
console.log("Test 8:", trap([3, 3, 3, 3]));
console.log("Test 9:", trap([5, 0, 0, 0, 5]));
console.log("Test 10:", trap([3, 0, 2, 0, 4]));`}
];