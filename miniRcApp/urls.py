from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^$', views.control ,name='control'),
    url(r'^template/$', views.index_template, name='index_template'),
    url(r'^template2/$', views.index2_template, name='index2_template'),
]