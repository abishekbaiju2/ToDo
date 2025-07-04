from Api.models import *
from Api.serializers import *
import random
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken,TokenError
from rest_framework.permissions import IsAuthenticated

def generateotp():
    return str(random.randint(1000,9999))

class UserRegisterView(APIView):
    
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = CustomUser.objects.create_user(**serializer.validated_data)
            user.is_active = False
            user.save()
            
            otp = generateotp()
            EmailOtp.objects.create(us_id = user,otp = otp)
            
            subject = 'Verify your Email (OTP)'
            message = f'Hi {user.first_name}, \nyour OTP is: {otp}'
            from_email = 'abishekbaiju2@gmail.com'
            recipient_list = [user.email]
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            
            return Response({'message' : 'OTP sent to email'}, status = status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    
class OtpVerifyView(APIView):
    
    def post(self,request):
        
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp :
            return Response({"error" : "Email and OTP are required."}, status = status.HTTP_400_BAD_REQUEST)
        
        
        try:
        
            user = CustomUser.objects.get(email = email)
            otp_obj = EmailOtp.objects.get(us_id = user)
        
            if otp_obj.is_expired():
                otp_obj.delete()
                return Response({"error": "OTP expired."}, status = status.HTTP_400_BAD_REQUEST)

            if otp_obj.otp == otp :
                user.is_active = True
                user.save()
                otp_obj.delete()
                
                subject = "Welcome to TODO App!"
                message = f"Hi {user.first_name}, \nWelcome to TODO — your personal space to plan,  prioritize, and achieve more every day!"
                from_email = "abishekbaiju2@gmail.com"
                recipient_list = [user.email]
                send_mail(subject, message, from_email, recipient_list, fail_silently=False)

                return Response({"message": "Email verified successfully."}, status = status.   HTTP_200_OK)
            
            else:
                return Response({"error" : "Invalid OTP."}, status = status.HTTP_404_NOT_FOUND)
        
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status = status.HTTP_404_NOT_FOUND)
        
        except EmailOtp.DoesNotExist:
            return Response({"error": "Invalid or already verified OTP."}, status = status.HTTP_404_NOT_FOUND)

class ResendOtpView(APIView):
    
    def post(self, request):
        
        email = request.data.get('email')
        
        if not email :
            return Response({"error" : "Email is required."}, status = status.HTTP_400_BAD_REQUEST)
        
        try:
            
            user = CustomUser.objects.get(email = email)
            
            if user.is_active :
                return Response({"error" : "Your account is already active."}, status = status.HTTP_400_BAD_REQUEST)
            
            otp = generateotp()
            otp_replace,created = EmailOtp.objects.get_or_create(us_id = user)
            otp_replace.otp = otp
            otp_replace.save()
            
            
            subject = 'Your New OTP'
            message = f'Hi {user.first_name}, \nyour new OTP is: {otp}'
            from_email = 'abishekbaiju2@gmail.com'
            recipient_list = [user.email]
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            
            return Response({"message":"New OTP sent to email."}, status = status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            return Response({"error" : "User not found."} , status = status.HTTP_404_NOT_FOUND)    
        
class UserLoginView(APIView):
    
    def post(self,request):
        
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status = status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email = email)
            
            if not user.is_active:
                return Response({'error': 'Email not verified.'}, status = status.HTTP_401_UNAUTHORIZED)
            
            user_obj = authenticate(request,username = user.username,password = password)
            
            if user_obj is not None:
                refresh = RefreshToken.for_user(user_obj)
                return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Login successful'
                },
                status = status.HTTP_200_OK)
                
            else:
                return Response({'error': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)
        
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status = status.HTTP_400_BAD_REQUEST)
        
class ForgetPasswordOtpView(APIView):
    
    def post(self,request):
        serializer = ForgotPasswordSerializer(data = request.data)
        if serializer.is_valid():
            try:
                email = serializer.validated_data['email']
                user = CustomUser.objects.get(email = email)

                otp = generateotp()
                PasswordResetOtp.objects.update_or_create(us_id = user, defaults={
                    'otp': otp,
                    'created_at': timezone.now() })

                subject = 'Reset Your Password'
                message = f'Hi {user.first_name}, \nYour password reset OTP is {otp}'
                from_email = 'abishekbaiju2@gmail.com'
                recipient_list = [user.email]
                send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            
                return Response({'message': 'OTP sent to your email.'}, status = status.HTTP_200_OK)
            
            except CustomUser.DoesNotExist:
                return Response({'error': 'User not found.'}, status = status.HTTP_404_NOT_FOUND)
            
            except Exception as e:
                return Response({'error': str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors,status = status.HTTP_400_BAD_REQUEST)
    
class ResetPasswordView(APIView):
    
    def post(self, request):
        
        serializer = ResetPasswordSerializer(data = request.data)
        if serializer.is_valid():
        
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']
            
            try:
                
                user = CustomUser.objects.get(email = email)
                otp_obj = PasswordResetOtp.objects.get(us_id = user)
                
                if otp_obj.is_expired():
                    otp_obj.delete()
                    return Response({"error": "OTP expired."}, status = status.HTTP_400_BAD_REQUEST)
                
                if otp_obj.otp != otp:
                    return Response({"error": "Invalid OTP."}, status = status.HTTP_400_BAD_REQUEST)
                
                user.set_password(new_password)
                user.save()
                otp_obj.delete()
                
                subject = 'Your Password Has Been Reset'
                message = f'Hi {user.first_name}, \nYour password has been successfully reset.'
                from_email = 'abishekbaiju2@gmail.com'
                recipient_list = [user.email]
                send_mail(subject, message, from_email, recipient_list, fail_silently=False)
                
                return Response({"message": "Password reset successful."}, status = status.HTTP_200_OK)
            
            except CustomUser.DoesNotExist:
                return Response({"error": "User not found."}, status = status.HTTP_404_NOT_FOUND)
            
            except PasswordResetOtp.DoesNotExist:
                return Response({"error": "Invalid OTP."}, status = status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)

class ResendForgotPasswordOTPView(APIView):
    
    def post(self,request):
        
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status = status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email = email)
            otp = generateotp()
            otp_replace,created = PasswordResetOtp.objects.get_or_create(us_id = user)
            otp_replace.otp = otp
            otp_replace.save()

            subject = 'Your New OTP'
            message = f'Hi {user.first_name}, \nYour OTP for Password Reset: {otp}'
            from_email = 'abishekbaiju2@gmail.com'
            recipient_list = [user.email]
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)

            return Response({'message': 'OTP resent to your email.'}, status = status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status = status.HTTP_404_NOT_FOUND)
   
class LogoutView(APIView):   
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logged out successfully."}, status = status.HTTP_205_RESET_CONTENT)
        
        except TokenError:
            return Response({"error": "Invalid or expired token."}, status = status.HTTP_400_BAD_REQUEST)
        
class TodoListCreateView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        todos = TodoModel.objects.filter(us_id = request.user)
        serializer = TodoSerializer(todos, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = TodoSerializer(data  = request.data)
        if serializer.is_valid():
            serializer.save(us_id = request.user)
            return Response(serializer.data, status = status.HTTP_201_CREATED)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    
class TaskUpdateView(APIView):
    
    permission_classes = [IsAuthenticated]

    def put(self, request, **kwargs):
        
        id = kwargs.get('pk')
        try:
            task = TodoModel.objects.get(id = id, us_id = request.user)
            serializer = TodoSerializer(task, data = request.data, partial = True)
    
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
        
        except TodoModel.DoesNotExist:
            return Response({"error": "Task not found."}, status = status.HTTP_404_NOT_FOUND)

class TaskDeleteView(APIView):
    
    permission_classes = [IsAuthenticated]

    def delete(self, request, **kwargs):
        
        id = kwargs.get('pk')
        
        try:
            task = TodoModel.objects.get(id = id, us_id = request.user)
            task.delete()
            return Response({"message": "Task deleted successfully."}, status = status.HTTP_200_OK)
        
        except TodoModel.DoesNotExist:
            return Response({"error": "Task not found."}, status = status.HTTP_404_NOT_FOUND)
        
class TaskStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        try:
            user = request.user
            completed_count = TodoModel.objects.filter(us_id = user, completed = True).count()
            incompleted_count = TodoModel.objects.filter(us_id = user, completed = False).count()

            return Response({
            "completed": completed_count,
            "incomplete": incompleted_count
            }, status = status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": "Something went wrong."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
class Completeupdate(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request,**kwargs):
        id = kwargs.get('pk')
        try:
            task = TodoModel.objects.get(id=id, us_id=request.user)
            task.completed = not task.completed
            task.save()
            serializer = TodoSerializer(task)
            return Response(serializer.data)
        except TodoModel.DoesNotExist:
            return Response({"error": "Task not found."}, status = status.HTTP_404_NOT_FOUND)
        
class IncompleteTasksView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = TodoModel.objects.filter(us_id = request.user, completed = False)
        serializer = TodoSerializer(tasks, many = True)
        return Response(serializer.data)
    
class CompletedTasksView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = TodoModel.objects.filter(us_id = request.user, completed = True)
        serializer = TodoSerializer(tasks, many=True)
        return Response(serializer.data)        