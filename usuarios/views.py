from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages
from pedidos.models import Pedido


def registro(request):
    """View para registro de novos usuários."""
    if request.user.is_authenticated:
        return redirect('core:home')
    
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Conta criada com sucesso! Bem-vindo à QUEOPS!')
            return redirect('core:home')
        else:
            messages.error(request, 'Erro ao criar conta. Verifique os dados informados.')
    else:
        form = UserCreationForm()
    
    return render(request, 'usuarios/registro.html', {'form': form})


def login_view(request):
    """View para login de usuários."""
    if request.user.is_authenticated:
        return redirect('core:home')
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Bem-vindo de volta, {username}!')
                next_url = request.GET.get('next', 'core:home')
                return redirect(next_url)
        messages.error(request, 'Usuário ou senha inválidos.')
    else:
        form = AuthenticationForm()
    
    return render(request, 'usuarios/login.html', {'form': form})


def logout_view(request):
    """View para logout de usuários."""
    logout(request)
    messages.info(request, 'Você saiu da sua conta.')
    return redirect('core:home')


@login_required
def perfil(request):
    """View para perfil do usuário com histórico de pedidos."""
    pedidos = Pedido.objects.filter(usuario=request.user).order_by('-criado_em')
    
    context = {
        'pedidos': pedidos,
    }
    return render(request, 'usuarios/perfil.html', context)
