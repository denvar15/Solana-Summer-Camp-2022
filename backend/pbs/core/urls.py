from django.urls import path, include
from rest_framework import routers
from core.views import *

router = routers.SimpleRouter()
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
    path('api/test_web3/', TestWeb3APIView.as_view(), name='test_web3'),
    path('api/start_bartering/', StartBarteringAPIView.as_view(), name='start_bartering'),
    path('api/make_offer/', MakeOfferAPIView.as_view(), name='make_offer'),
    path('api/approve_barter/', ApproveBarterAPIView.as_view(), name='approve_barter'),
    path('api/revoke_barter/', RevokeBarterAPIView.as_view(), name='revoke_barter'),
    path('api/approve_iter_chain_barter/', ApproveIterChainBarterAPIView.as_view(), name='approve_iter_chain_barter'),
    path('api/', include((router.urls,'models'))),
] 
