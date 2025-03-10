from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import JsonResponse
from app.models import CustomUser  # Import your CustomUser model
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods


@csrf_exempt
def register(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")
        age = request.POST.get("age")
        school = request.POST.get("school")
        theme = request.POST.get("theme", "dark")  # Default to 'dark' if not provided

        if not (username and email and password):
            return JsonResponse({"error": "All fields are required"}, status=400)

        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)

        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            age=age,
            school=school,
            theme=theme,
        )
        user.save()

        return JsonResponse({"message": "User registered successfully"}, status=201)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def login(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            return JsonResponse({"message": "Login successful"}, status=200)
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def logout(request):
    if request.method == "POST":
        auth_logout(request)
        return JsonResponse({"message": "Logout successful"}, status=200)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
@login_required
def current_user(request):
    user = request.user
    return JsonResponse(
        {
            "username": user.username,
            "email": user.email,
            "age": user.age,
            "school": user.school,
            "theme": user.theme,
        }
    )


@login_required
@csrf_exempt
@require_http_methods(["PUT"])
def update_profile(request):
    user = request.user
    data = request.json()  # Parse JSON data from the request

    # Update user fields
    user.username = data.get("username", user.username)
    user.age = data.get("age", user.age)
    user.school = data.get("school", user.school)
    user.work_duration = data.get("work_duration", user.work_duration)
    user.rest_duration = data.get("rest_duration", user.rest_duration)
    user.theme = data.get("theme", user.theme)

    user.save()

    return JsonResponse(
        {
            "message": "Profile updated successfully!",
            "username": user.username,
            "age": user.age,
            "school": user.school,
            "work_duration": user.work_duration,
            "rest_duration": user.rest_duration,
            "theme": user.theme,
        }
    )
