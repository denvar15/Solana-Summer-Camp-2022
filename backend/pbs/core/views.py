from django.shortcuts import render
from rest_framework import viewsets
from core.serializers import *

class FriendViewSet(viewsets.ModelViewSet):
    queryset = Friend.objects.all()
    serializer_class = FriendsSerializer


class AchiveViewSet(viewsets.ModelViewSet):
    queryset = Achive.objects.all()
    serializer_class = AchiveSerializer


class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer


class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class NFTViewSet(viewsets.ModelViewSet):
    queryset = NFT.objects.all()
    serializer_class = NFTSerializer


class GuildViewSet(viewsets.ModelViewSet):
    queryset = Guild.objects.all()
    serializer_class = GuildSerializer


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserGamesViewSet(viewsets.ModelViewSet):
    queryset = UserGames.objects.all()
    serializer_class = UserGamesSerializer


class WikiArticleViewSet(viewsets.ModelViewSet):
    queryset = WikiArticle.objects.all()
    serializer_class = WikiArticleSerializer


class OfferViewSet(viewsets.ModelViewSet):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer


class OfferResponseViewSet(viewsets.ModelViewSet):
    queryset = OfferResponse.objects.all()
    serializer_class = OfferResponseSerializer