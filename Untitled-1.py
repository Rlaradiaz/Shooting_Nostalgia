def solution(A):
    existing_numbers = set()
    
    # Step 2: Add positive numbers to the set
    for num in A:
        if num > 0:
            existing_numbers.add(num)
            
    # Step 3: Find the smallest positive integer not in the array
    smallest_positive = 1
    while smallest_positive in existing_numbers:
        smallest_positive += 1
        
    # Step 4: Return the smallest positive integer
    return smallest_positive