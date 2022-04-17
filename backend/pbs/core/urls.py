from django.urls import path, include
from rest_framework import routers
from core.views import *

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'user_games', UserGamesViewSet)
router.register(r'friend', FriendViewSet)
router.register(r'achive', AchiveViewSet)
router.register(r'wallet', WalletViewSet)
router.register(r'game', GameViewSet)
router.register(r'nft', NFTViewSet)
router.register(r'guild', GuildViewSet)
router.register(r'message', MessageViewSet)
router.register(r'wiki_article',  WikiArticleViewSet)
router.register(r'offer', OfferViewSet)
router.register(r'offer_response', OfferResponseViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
