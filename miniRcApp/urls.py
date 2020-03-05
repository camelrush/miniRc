from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^cv/$', views.control_view, name='control_view'),
    url(r'^ctrlapi/$', views.control ,name='control'),
]