from rest_framework import serializers
from Api.models import *

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'first_name', 'last_name', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True, 'min_length': 6}}
        
        def validate_email(self, value):
            if CustomUser.objects.filter(email=value).exists():
                raise serializers.ValidationError("Email already registered.")
            return value
        
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not CustomUser.objects.filter(email = value).exists():
            raise serializers.ValidationError("Email not registered.")
        return value
    
class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=4)
    new_password = serializers.CharField(write_only = True, min_length = 6)

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email not found.")
        return value
    
class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoModel
        fields = ['id','title',"completed",'us_id','created_at']
        read_only_fields = ['id','us_id','created_at']