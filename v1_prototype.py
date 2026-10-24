"""
=============================================================================
STUDENT ACCESS MANAGEMENT SYSTEM (Original Foundation Prototype v1)
Authored by: Honielyn
Project Lineage: Precursor to BISU Clarin Secure Smart Campus System (v2)
=============================================================================
This program serves as the initial foundation prototype for the campus system.
It demonstrates:
1. User Access Verification (Rule-based authorization)
2. Access Control Matrix (Binary relations R ⊆ UserTypes × Areas)
3. Elementary Number Theory (Parity, Divisibility by 5, Euclidean Algorithm for GCD)
=============================================================================
"""

def check_access():
    print("\n--- USER ACCESS CHECK ---")
    user_type = input("Enter user type (Student/Teacher/Visitor): ").strip().lower()  
    area = input("Enter area (Library/Laboratory/Office): ").strip().lower()  

    # Access rules  
    if user_type == "student":  
        if area in ("library", "laboratory"):  
            print("Access Granted.")  
        else:  
            print("Access Denied.")  

    elif user_type == "teacher":  
        if area in ("library", "laboratory", "office"):  
            print("Access Granted.")  
        else:  
            print("Access Denied.")  

    elif user_type == "visitor":  
        if area == "library":  
            print("Limited Access Granted (Reading Room Only).")  
        else:  
            print("Access Denied.")  

    else:  
        print("Invalid user type.")

def show_matrix():
    print("\n--- ACCESS MATRIX (Binary Relation R ⊆ UserTypes × Areas) ---")
    print("\nUser Type | Library | Laboratory | Office")  
    print("------------------------------------------")  
    print("Student   | Yes     | Yes        | No")  
    print("Teacher   | Yes     | Yes        | Yes")  
    print("Visitor   | Yes*    | No         | No")  
    print("\n*Visitor has limited access.")

def number_theory():
    print("\n--- NUMBER THEORY CHECK ---")
    try:  
        number = int(input("Enter an ID number: "))  

        # Check even or odd  
        if number % 2 == 0:  
            print(f"{number} is EVEN.")  
        else:  
            print(f"{number} is ODD.")  

        # Check divisibility by 5  
        if number % 5 == 0:  
            print(f"{number} is divisible by 5.")  
        else:  
            print(f"{number} is NOT divisible by 5.")  

        # Find GCD using Euclidean Algorithm
        second_number = int(input("Enter another number for GCD: "))  

        a = abs(number)  
        b = abs(second_number)  

        print(f"\nComputing GCD({a}, {b}) using Euclidean Algorithm:")
        step = 1
        orig_a, orig_b = a, b
        while b != 0:  
            quotient = a // b
            remainder = a % b
            print(f"  Step {step}: {a} = {b} * {quotient} + {remainder}")
            a, b = b, remainder
            step += 1

        print(f"Greatest Common Divisor (GCD) of ({orig_a}, {orig_b}): {a}")  

    except ValueError:  
        print("Invalid input. Please enter numbers only.")

def main():
    while True:  
        print("\n================================")  
        print(" STUDENT ACCESS MANAGEMENT SYSTEM")  
        print(" (Foundational Prototype v1)")
        print("================================")  
        print("1. Check User Access")  
        print("2. View Access Matrix")  
        print("3. Number Theory Check")  
        print("4. Exit")  

        choice = input("\nEnter your choice (1-4): ").strip()  

        if choice == "1":  
            check_access()  
        elif choice == "2":  
            show_matrix()  
        elif choice == "3":  
            number_theory()  
        elif choice == "4":  
            print("\nThank you for using the system!")  
            break  
        else:  
            print("\nInvalid choice. Please try again.")

if __name__ == "__main__":
    main()
