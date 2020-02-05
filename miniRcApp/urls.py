from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.control ,name='control'),
    url(r'^template/$', views.index_template, name='index_template'),
]