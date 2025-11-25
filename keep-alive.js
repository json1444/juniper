// keep-alive.js - Sistema para manter o projeto ativo
class KeepAliveManager {
    constructor() {
        this.lastActivity = Date.now();
        this.checkInterval = 5 * 24 * 60 * 60 * 1000; // 5 dias em milissegundos
        this.init();
    }

    init() {
        console.log('🚀 KeepAlive Manager Iniciado');
        
        // Verificar a cada 5 dias
        setInterval(() => {
            this.performKeepAliveAction();
        }, this.checkInterval);

        // Também verificar quando a página carrega
        this.performKeepAliveAction();
        
        // Monitorar atividade do usuário
        this.setupActivityMonitoring();
    }

    setupActivityMonitoring() {
        const activities = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        activities.forEach(activity => {
            document.addEventListener(activity, () => {
                this.lastActivity = Date.now();
            });
        });
    }

    async performKeepAliveAction() {
        try {
            console.log('🔄 Executando ação keep-alive...');
            
            // Criar uma conta temporária se necessário
            await this.createTemporaryAccount();
            
            // Fazer uma pequena operação no Supabase
            await this.performSupabaseOperation();
            
            console.log('✅ Ação keep-alive concluída com sucesso');
            
        } catch (error) {
            console.error('❌ Erro na ação keep-alive:', error);
            this.retryKeepAlive();
        }
    }

    async createTemporaryAccount() {
        // Verificar se já temos contas suficientes
        const accountCount = localStorage.getItem('keepAliveAccountCount') || 0;
        
        if (accountCount >= 3) {
            console.log('✅ Número suficiente de contas keep-alive já existem');
            return;
        }

        try {
            const timestamp = Date.now();
            const tempEmail = `keepalive${timestamp}@temp.luckpet.com`;
            const tempPassword = `temp${timestamp}`;
            
            const { data, error } = await supabase.auth.signUp({
                email: tempEmail,
                password: tempPassword,
                options: {
                    data: {
                        nome: `KeepAlive_${timestamp}`,
                        avatar: 'cachorro',
                        is_keepalive: true
                    }
                }
            });

            if (error) {
                if (error.message.includes('already registered')) {
                    console.log('📧 Conta keep-alive já existe');
                } else {
                    throw error;
                }
            } else {
                console.log('✅ Conta keep-alive criada:', tempEmail);
                localStorage.setItem('keepAliveAccountCount', parseInt(accountCount) + 1);
            }

        } catch (error) {
            console.log('⚠️ Não foi possível criar conta keep-alive:', error.message);
        }
    }

    async performSupabaseOperation() {
        try {
            // Fazer uma consulta simples para manter a conexão ativa
            const { data, error } = await supabase
                .from('profiles')
                .select('count')
                .limit(1);

            if (!error) {
                console.log('✅ Operação Supabase realizada com sucesso');
            }
        } catch (error) {
            console.log('⚠️ Operação Supabase falhou:', error.message);
        }
    }

    retryKeepAlive() {
        // Tentar novamente em 1 hora se falhar
        setTimeout(() => {
            this.performKeepAliveAction();
        }, 60 * 60 * 1000);
    }

    // Método para forçar uma ação keep-alive manualmente
    forceKeepAlive() {
        this.performKeepAliveAction();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Só inicializar se estivermos na página principal
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('.html')) {
        
        window.keepAliveManager = new KeepAliveManager();
    }
});

// Função global para verificar status
window.checkKeepAliveStatus = function() {
    const lastActivity = window.keepAliveManager ? 
        new Date(window.keepAliveManager.lastActivity).toLocaleString() : 'N/A';
    
    alert(`Status KeepAlive:\nÚltima atividade: ${lastActivity}\nSistema ativo: ✅`);
};