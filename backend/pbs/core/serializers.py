from rest_framework import serializers
from core.models import *

# ModelSerializers 
class FriendsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = '__all__'


class AchiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achive
        fields = '__all__'


class UserGamesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGames
        fields = '__all__'


class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = '__all__'


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'


class NFTSerializer(serializers.ModelSerializer):
    class Meta:
        model = NFT
        fields = '__all__'


class GuildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guild
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class WikiArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WikiArticle
        fields = '__all__'


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = '__all__'


class OfferResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferResponse
        fields = '__all__'