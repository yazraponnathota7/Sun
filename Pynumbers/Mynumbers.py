import numpy as np

# array = np.array([2, 8, 9])  # like matrix
# print(array)
# print(type(array))
# print(array.shape)

array2 = np.zeros((3, 2), dtype=int)
array2 = np.ones((3, 2), dtype=int)
array2 = np.full((3, 2), 3, dtype=int)
array2 = np.random.random((3, 2))
# print(array2[1,1])
# print(array2 > 0.5)
# print(array2[array2 > 0.5])

print(np.sum(array2))  # floor , round, ceil


first = np.array([5, 7, 7])
second = np.array([5, 7, 7])
# print(first + second)

# print(first + 5)

# real example

array_me = first
array_cm = array_me * 1000
print(array_cm)

# with pure python

num_me = [5, 7, 7]
num_cm = [x * 1000 for x in num_me]
print(num_cm)
