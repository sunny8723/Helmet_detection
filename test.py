n=int(input())
j=0
l=[0 for i in range(n)]
for i in range(n):
    a=int(input())
    if a!=0:
        l[j]=a
        j+=1
for i in l:
    print(i,end="")