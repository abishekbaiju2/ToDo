from django.urls import path
from Api.views import *
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('todo/register/',UserRegisterView.as_view(), name = 'register'),
    path("todo/verifyotp/",OtpVerifyView.as_view(),name = 'verifyotp'),
    path("todo/resendotp/",ResendOtpView.as_view(),name = 'resentotp'),
    path("todo/login/",UserLoginView.as_view(),name = 'login'),
    path('todo/forgetpasswordotp/',ForgetPasswordOtpView.as_view(),name = 'forgetpasswordotp'),
    path("todo/resetpassword/",ResetPasswordView.as_view(),name = 'resetpassword'),
    path('todo/logout/',LogoutView.as_view(), name = 'logout'),
    path('todo/taskslistcreate/', TodoListCreateView.as_view(), name = 'taskslistcreate'),
    path('todo/token/refresh/', TokenRefreshView.as_view(), name = 'tokenrefresh'),
    path('todo/tasks/update/<int:pk>/', TaskUpdateView.as_view(), name = 'taskupdate'),
    path('todo/tasks/delete/<int:pk>/', TaskDeleteView.as_view(), name = 'taskdelete'),
    path('todo/tasks/stats/', TaskStatsView.as_view(),name = 'tasksstats'),
    path("todo/resendpasswordotp/",ResendForgotPasswordOTPView.as_view(),name = 'resendpasswordotp'),
    path('todo/tasks/complete/<int:pk>/', Completeupdate.as_view(), name = 'completeupdate'),
    path('todo/incomplete/',IncompleteTasksView.as_view(), name='incompletetasks'),
    path('todo/completed/',CompletedTasksView.as_view(), name='completed-tasks'),
]