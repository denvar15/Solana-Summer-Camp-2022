from tabnanny import verbose
from django.db import models


class User(models.Model):
    ''' Пользователь '''
    name = models.CharField(verbose_name='Имя', max_length=100)
    games = models.ForeignKey(to='UserGames', verbose_name='Мои игры', on_delete=models.CASCADE, related_name='users', null=True, blank=True)
    discord = models.CharField(verbose_name='Discord', max_length=100, null=True, blank=True)
    telegram = models.CharField(verbose_name='Telegram', max_length=100, null=True, blank=True)

    def __str__(self) -> str:
        return self.name

class Wallet(models.Model):
    ''' Кошелек '''
    address = models.CharField(verbose_name='Адрес', unique=True, primary_key=True, max_length=100)
    user = models.ForeignKey(to=User, verbose_name='Игрок', on_delete=models.CASCADE, related_name='wallets')

    def __str__(self) -> str:
        return self.address


class Game(models.Model):
    ''' Игра '''
    name = models.CharField(verbose_name='Название', max_length=100)
    description = models.TextField(verbose_name='Описание',  null=True, blank=True)
    url = models.URLField(verbose_name='Ссылка', null=True, blank=True)
    img = models.URLField(verbose_name='Изображение', null=True, blank=True)

    def __str__(self) -> str:
        return self.name


class NFT(models.Model):
    ''' NFT '''
    address = models.CharField(verbose_name='Адрес', unique=True, primary_key=True, max_length=100)
    name = models.CharField(verbose_name='Название', max_length=100)
    description = models.TextField(verbose_name='Описание',  null=True, blank=True)
    img = models.URLField(verbose_name='Изображение', null=True, blank=True)
    count = models.IntegerField(verbose_name='Количество', default=1)
    usergames = models.ForeignKey(to='UserGames', verbose_name='Игра пользователя', on_delete=models.CASCADE, related_name='nfts', null=True, blank=True)

    def __str__(self) -> str:
        return self.name

class Guild(models.Model):
    ''' Гильдия '''
    name = models.CharField(verbose_name='Название', max_length=100)
    description = models.TextField(verbose_name='Описание',  null=True, blank=True)
    url = models.URLField(verbose_name='Ссылка', null=True, blank=True)
    img = models.URLField(verbose_name='Изображение', null=True, blank=True)

    def __str__(self) -> str:
        return self.name


class UserGames(models.Model):
    ''' Игры пользователя '''
    game = models.ForeignKey(to=Game, verbose_name='Игра', on_delete=models.CASCADE, related_name='usergames')
    guild = models.ForeignKey(to=Guild, verbose_name='Гильдия', on_delete=models.CASCADE, related_name='usergames', null=True, blank=True)
    achives = models.ManyToManyField(to='Achive', verbose_name='Достижения', related_name='usergames')
    
    def __str__(self) -> str:
        return f"{self.game} - {self.guild}"

class Achive(models.Model):
    ''' Достижения '''
    name = models.CharField(verbose_name='Название', max_length=100)
    description = models.TextField(verbose_name='Описание',  null=True, blank=True)
    url = models.URLField(verbose_name='Ссылка', null=True, blank=True)
    img = models.URLField(verbose_name='Изображение', null=True, blank=True)

    def __str__(self) -> str:
        return self.name

class Friend(models.Model):
    ''' Друзья '''
    user = models.ForeignKey(to=User, verbose_name='Игрок', on_delete=models.CASCADE, related_name='friends')
    friend = models.ForeignKey(to=User, verbose_name='Друг', on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.user} - {self.friend}"


class Message(models.Model):
    ''' Сообщение '''
    sender = models.ForeignKey(to=User, verbose_name='Отправитель', on_delete=models.CASCADE, related_name='sender')
    recipient = models.ForeignKey(to=User, verbose_name='Получатель', on_delete=models.CASCADE, related_name='recipient')
    date = models.DateTimeField(auto_now_add=True)
    text = models.TextField(verbose_name='Сообщение')


class WikiArticle(models.Model):
    ''' Статья на вики '''
    author =  models.ForeignKey(to=User, verbose_name='Автор', on_delete=models.CASCADE, related_name='wiki_author')
    name = models.CharField(verbose_name='Название', max_length=255)
    text = models.TextField(verbose_name='Текст')
    date = models.DateField(auto_now=True)


class Offer(models.Model):
    ''' Предложение для обмена '''
    OFFER_STATUS = (
        (0, 'Размещено предложение'),
        (1, 'Ожидание подтверждения'),
        (2, 'Сделка завершена'),
    )
    author =  models.ForeignKey(to=User, verbose_name='Автор', on_delete=models.CASCADE, related_name='offer_author')
    offered_item = models.ForeignKey(to=NFT, verbose_name='Предлагаемый предмет', on_delete=models.CASCADE, related_name='offered_item')
    needed_items = models.ManyToManyField(to=NFT, verbose_name='Список для обмена')
    status = models.IntegerField(verbose_name='Статус', choices=OFFER_STATUS)


class OfferResponse(models.Model):
    ''' Отклик на предложение '''
    offer =  models.ForeignKey(to=Offer, verbose_name='Предложение', on_delete=models.CASCADE, related_name='offer_reponses')
    author =  models.ForeignKey(to=User, verbose_name='Автор отклика', on_delete=models.CASCADE, related_name='offer_reponse_author')
    offered_item = models.ForeignKey(to=NFT, verbose_name='Предлагаемый предмет', on_delete=models.CASCADE, related_name='offer_reponses_item')
    date = models.DateTimeField(auto_now_add=True)