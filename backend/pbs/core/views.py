from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from core.serializers import *
import web3


def __get_abi_BarterWithArrays() -> list:
    from abi.BarterWithArrays import ABI
    return ABI


class TestWeb3APIView(APIView):
    def post(self, request, format=None):
        provider = request.data.get("provider", None)
        if provider is None:
            return Response({"result": False})
        w3 = web3.Web3(web3.Web3.HTTPProvider(provider))
        if w3.isConnected():
            print(dir(w3.eth.sendTransaction()))
            response = {
                "result": True,
            }
        else:
            response = {
                "result": False,
            }
        return Response(response)


class StartBarteringAPIView(APIView):
    """address token,
    uint256 tokenId,
    uint256 durationHours,
    address[] memory acceptedToken,
    uint256[] memory acceptedTokenId,
    uint256 tokenStandard,
    uint256[] memory acceptedTokenStandard
    """
    def post(self, request, format=None):
        token = request.data.get("token", None)
        tokenId = request.data.get("tokenId", None)
        durationHours = request.data.get("durationHours", None)
        acceptedToken = request.data.get("acceptedToken", None)
        acceptedTokenId = request.data.get("acceptedTokenId", None)
        tokenStandard = request.data.get("tokenStandard", None)
        acceptedTokenStandard = request.data.get("acceptedTokenStandard", None)
        provider = request.data.get("provider", None)
        contract_address = request.data.get("contract_address", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")

        w3 = web3.Web3(web3.Web3.HTTPProvider(provider))
        if w3.isConnected():
            # print(dir(w3.eth.sendTransaction()))
            contract = w3.eth.contract(contract_address, abi=__get_abi_BarterWithArrays())
            res = contract.functions.startBartering(
                token,
                tokenId,
                durationHours,
                acceptedToken,
                acceptedTokenId,
                tokenStandard,
                acceptedTokenStandard,
            ).call()
            #TODO: save to db
            response = {
                "result": res,
            }
        else:
            response = {
                "error": "Error connect",
            }
        return Response(response)


class MakeOfferAPIView(APIView):
    """address wantedToken, 
       uint256 wantedTokenId, 
       address offerToken, 
       uint256 offerTokenId,
       uint256 wantedTokenStandard, 
       uint256 offerTokenStandard
    """
    def post(self, request, format=None):
        wantedToken = request.data.get("wantedToken", None)
        wantedTokenId = request.data.get("wantedTokenId", None)
        offerToken = request.data.get("offerToken", None)
        offerTokenId = request.data.get("offerTokenId", None)
        wantedTokenStandard = request.data.get("wantedTokenStandard", None)
        offerTokenStandard = request.data.get("offerTokenStandard", None)
        provider = request.data.get("provider", None)
        contract_address = request.data.get("contract_address", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")

        w3 = web3.Web3(web3.Web3.HTTPProvider(provider))
        if w3.isConnected():
            # print(dir(w3.eth.sendTransaction()))
            contract = w3.eth.contract(contract_address, abi=__get_abi_BarterWithArrays())
            res = contract.functions.makeOffer(
                wantedToken,
                wantedTokenId,
                offerToken,
                offerTokenId,
                wantedTokenStandard,
                offerTokenStandard,
            ).call()
            #TODO: save to db
            response = {
                "result": res,
            }
        else:
            response = {
                "error": "Error connect",
            }
        return Response(response)


class ApproveBarterAPIView(APIView):
    """address token, 
       uint256 tokenId,
       uint256 tokenStandard
    """
    def post(self, request, format=None):
        token = request.data.get("token", None)
        tokenId = request.data.get("tokenId", None)
        tokenStandard = request.data.get("tokenStandard", None)
        provider = request.data.get("provider", None)
        contract_address = request.data.get("contract_address", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")

        w3 = web3.Web3(web3.Web3.HTTPProvider(provider))
        if w3.isConnected():
            # print(dir(w3.eth.sendTransaction()))
            contract = w3.eth.contract(contract_address, abi=__get_abi_BarterWithArrays())
            res = contract.functions.approveBarter(
                token,
                tokenId,
                tokenStandard,
            ).call()
            #TODO: save to db
            response = {
                "result": res,
            }
        else:
            response = {
                "error": "Error connect",
            }
        return Response(response)


class RevokeBarterAPIView(APIView):
    """address token, 
       uint256 tokenId,
       uint256 tokenStandard
    """
    def post(self, request, format=None):
        token = request.data.get("token", None)
        tokenId = request.data.get("tokenId", None)
        tokenStandard = request.data.get("tokenStandard", None)
        provider = request.data.get("provider", None)
        contract_address = request.data.get("contract_address", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")

        w3 = web3.Web3(web3.Web3.HTTPProvider(provider))
        if w3.isConnected():
            # print(dir(w3.eth.sendTransaction()))
            contract = w3.eth.contract(contract_address, abi=__get_abi_BarterWithArrays())
            res = contract.functions.revokeBarter(
                token,
                tokenId,
                tokenStandard,
            ).call()
            #TODO: save to db
            response = {
                "result": res,
            }
        else:
            response = {
                "error": "Error connect",
            }
        return Response(response)


class ApproveIterChainBarterAPIView(APIView):
    """address token,
       uint256 tokenId,
       uint256 tokenStandard,
       address borrower
    """
    def post(self, request, format=None):
        token = request.data.get("token", None)
        tokenId = request.data.get("tokenId", None)
        tokenStandard = request.data.get("tokenStandard", None)
        borrower = request.data.get("borrower", None)
        provider = request.data.get("provider", None)
        contract_address = request.data.get("contract_address", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")

        w3 = web3.Web3(web3.Web3.HTTPProvider(provider))
        if w3.isConnected():
            # print(dir(w3.eth.sendTransaction()))
            contract = w3.eth.contract(contract_address, abi=__get_abi_BarterWithArrays())
            res = contract.functions.approveIterChainBarter(
                token,
                tokenId,
                tokenStandard,
                borrower
            ).call()
            #TODO: save to db
            response = {
                "result": res,
            }
        else:
            response = {
                "error": "Error connect",
            }
        return Response(response)


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
