from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^cv/$', views.control_view, name='control_view'),
    url(r'^cv/capture/$', views.capture, name='capture'),
    url(r'^ctrlapi/$', views.control ,name='control'),
]