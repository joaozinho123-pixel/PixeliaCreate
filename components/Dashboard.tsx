
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  PenTool, Plus, Search, Bell, Home, FolderOpen, Star, Settings, 
  UserCircle, Grid, List, Moon, Globe, ChevronDown, Trash2,
  Sparkles, MoreHorizontal, Edit2, X, Check, Menu, LogOut, Shield,
  Sun, MessageSquare, ChevronRight, Mail, Zap, Smartphone, Monitor,
  Ruler, Magnet, LayoutTemplate, Info, HelpCircle
} from 'lucide-react';
import { ProjectType, Project, Notification } from '../types';

interface DashboardProps {
    projects: Project[];
    onSelectMode: (type: ProjectType) => void;
    onOpenProject: (project: Project) => void;
    onDeleteProject: (projectId: string | number) => void;
    onRenameProject: (projectId: string | number, newTitle: string) => void;
    onToggleStar: (projectId: string | number) => void;
    isMobile?: boolean;
}

const PixeliaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 16H30V42C30 43.1046 29.1046 44 28 44H22C20.8954 44 20 43.1046 20 42V16Z" fill="#1e3a8a" />
    <path d="M20 6H34C38.4183 6 42 9.58172 42 14V18C42 22.4183 38.4183 26 34 26H30V16H20V6Z" fill="#2dd4bf" />
    <path d="M30 16L30 26L34 26L34 16L30 16Z" fill="#14b8a6" />
    <rect x="6" y="6" width="8" height="8" rx="2" fill="#2dd4bf" />
    <path d="M6 24H18V36H6V24Z" fill="#f97316" />
    <path d="M18 24L22 20V32L18 36V24Z" fill="#c2410c" />
    <path d="M6 24L10 20H22L18 24H6Z" fill="#fdba74" />
    <rect x="6" y="38" width="8" height="8" rx="2" fill="#ea580c" />
  </svg>
);

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', title: 'Welcome to Pixelia!', message: 'Start creating your first infinite whiteboard today.', time: 'Just now', read: false },
    { id: '2', title: 'New Feature', message: 'Try out the new text fonts available in the editor.', time: '1h ago', read: false },
    { id: '3', title: 'Tip of the day', message: 'Press Spacebar to pan around the canvas quickly.', time: '1d ago', read: true },
];

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const TRANSLATIONS: Record<string, any> = {
    en: {
        home: 'Home',
        projects: 'My Boards',
        starred: 'Starred',
        settings: 'Settings',
        search_placeholder: 'Search boards...',
        welcome_back: 'Welcome back,',
        creator: 'Creator',
        create_new: 'New Whiteboard',
        create_subtitle: 'Start an infinite canvas for your ideas',
        results_for: 'Results for',
        recent_designs: 'Recent Boards',
        no_starred: 'No starred boards',
        no_projects: 'No boards yet',
        star_prompt: 'Star your favorite boards to see them here.',
        create_prompt: 'Create your first infinite whiteboard.',
        profile: 'Profile',
        preferences: 'Preferences',
        dark_mode: 'Dark Mode',
        light_mode: 'Light Mode',
        notifications: 'Notifications',
        language: 'Language',
        log_out: 'Log Out',
        pro_member: 'Pro Member',
        edit_profile: 'Edit',
        mark_all_read: 'Mark all read',
        no_new_notifications: 'No new notifications',
        delete_confirm: 'Are you sure?',
    },
    pt: {
        home: 'Início',
        projects: 'Meus Quadros',
        starred: 'Favoritos',
        settings: 'Configurações',
        search_placeholder: 'Buscar quadros...',
        welcome_back: 'Bem-vindo de volta,',
        creator: 'Criador',
        create_new: 'Novo Quadro',
        create_subtitle: 'Inicie uma tela infinita para suas ideias',
        results_for: 'Resultados para',
        recent_designs: 'Quadros Recentes',
        no_starred: 'Sem favoritos',
        no_projects: 'Nenhum quadro ainda',
        star_prompt: 'Favorite seus quadros para vê-los aqui.',
        create_prompt: 'Crie seu primeiro quadro infinito.',
        profile: 'Perfil',
        preferences: 'Preferências',
        dark_mode: 'Modo Escuro',
        light_mode: 'Modo Claro',
        notifications: 'Notificações',
        language: 'Idioma',
        log_out: 'Sair',
        pro_member: 'Membro Pro',
        edit_profile: 'Editar',
        mark_all_read: 'Marcar lidas',
        no_new_notifications: 'Sem novas notificações',
        delete_confirm: 'Tem certeza?',
    },
    es: {
        home: 'Inicio',
        projects: 'Mis Tableros',
        starred: 'Destacados',
        settings: 'Ajustes',
        search_placeholder: 'Buscar tableros...',
        welcome_back: 'Bienvenido de nuevo,',
        creator: 'Creador',
        create_new: 'Nuevo Tablero',
        create_subtitle: 'Comienza un lienzo infinito para tus ideas',
        results_for: 'Resultados para',
        recent_designs: 'Tableros Recientes',
        no_starred: 'Sin tableros destacados',
        no_projects: 'Sin tableros aún',
        star_prompt: 'Destaca tus tableros favoritos para verlos aquí.',
        create_prompt: 'Crea tu primer tablero infinito.',
        profile: 'Perfil',
        preferences: 'Preferencias',
        dark_mode: 'Modo Oscuro',
        light_mode: 'Modo Claro',
        notifications: 'Notificaciones',
        language: 'Idioma',
        log_out: 'Cerrar Sesión',
        pro_member: 'Miembro Pro',
        edit_profile: 'Editar',
        mark_all_read: 'Marcar leídas',
        no_new_notifications: 'Sin nuevas notificaciones',
        delete_confirm: '¿Estás seguro?',
    },
    fr: {
        home: 'Accueil',
        projects: 'Mes Tableaux',
        starred: 'Favoris',
        settings: 'Paramètres',
        search_placeholder: 'Rechercher...',
        welcome_back: 'Bon retour,',
        creator: 'Créateur',
        create_new: 'Nouveau Tableau',
        create_subtitle: 'Démarrez une toile infinie pour vos idées',
        results_for: 'Résultats pour',
        recent_designs: 'Tableaux Récents',
        no_starred: 'Aucun favori',
        no_projects: 'Aucun tableau',
        star_prompt: 'Ajoutez des favoris pour les voir ici.',
        create_prompt: 'Créez votre premier tableau.',
        profile: 'Profil',
        preferences: 'Préférences',
        dark_mode: 'Mode Sombre',
        light_mode: 'Mode Clair',
        notifications: 'Notifications',
        language: 'Langue',
        log_out: 'Déconnexion',
        pro_member: 'Membre Pro',
        edit_profile: 'Modifier',
        mark_all_read: 'Tout lu',
        no_new_notifications: 'Pas de notifications',
        delete_confirm: 'Êtes-vous sûr ?',
    },
    de: {
        home: 'Startseite',
        projects: 'Meine Boards',
        starred: 'Favoriten',
        settings: 'Einstellungen',
        search_placeholder: 'Boards suchen...',
        welcome_back: 'Willkommen zurück,',
        creator: 'Ersteller',
        create_new: 'Neues Board',
        create_subtitle: 'Starten Sie eine unendliche Leinwand',
        results_for: 'Ergebnisse für',
        recent_designs: 'Neueste Boards',
        no_starred: 'Keine Favoriten',
        no_projects: 'Noch keine Boards',
        star_prompt: 'Markieren Sie Boards als Favorit.',
        create_prompt: 'Erstellen Sie Ihr erstes Board.',
        profile: 'Profil',
        preferences: 'Einstellungen',
        dark_mode: 'Dunkelmodus',
        light_mode: 'Heller Modus',
        notifications: 'Benachrichtigungen',
        language: 'Sprache',
        log_out: 'Abmelden',
        pro_member: 'Pro Mitglied',
        edit_profile: 'Bearbeiten',
        mark_all_read: 'Alle gelesen',
        no_new_notifications: 'Keine neuen Benachrichtigungen',
        delete_confirm: 'Sind Sie sicher?',
    }
};

type TabType = 'HOME' | 'PROJECTS' | 'STARRED' | 'SETTINGS';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden group ${active ? 'text-white shadow-xl shadow-teal-500/20 scale-105' : 'text-gray-500 hover:bg-teal-50/50 hover:pl-6 hover:text-teal-600'}`}>
        {active && (<div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a] to-[#14b8a6] rounded-2xl animate-fade-in" />)}
        <Icon size={22} className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="relative z-10 tracking-wide">{label}</span>
        {active && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
    </button>
);

const ProjectCard: React.FC<{ project: Project; onClick: () => void; onDelete: (id: string | number) => void; onRename: (id: string | number, newTitle: string) => void; onToggleStar: (id: string | number) => void; viewMode: 'GRID' | 'LIST'; t: any; isMobile?: boolean }> = ({ project, onClick, onDelete, onRename, onToggleStar, viewMode, t, isMobile }) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [editTitle, setEditTitle] = useState(project.title);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { if (isRenaming && inputRef.current) inputRef.current.focus(); }, [isRenaming]);
    
    const handleSaveRename = (e?: React.FormEvent) => { 
        e?.preventDefault(); 
        if (editTitle.trim()) onRename(project.id, editTitle); 
        else setEditTitle(project.title); 
        setIsRenaming(false); 
    };

    if (viewMode === 'LIST') {
        return (
            <div onClick={onClick} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all cursor-pointer group relative">
                <div className={`w-14 h-14 rounded-xl ${project.thumbnail} flex items-center justify-center shrink-0`}><PenTool className="text-gray-700 opacity-60" size={24} /></div>
                <div className="flex-1 min-w-0">
                    {isRenaming ? (<input ref={inputRef} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()} onBlur={() => handleSaveRename()} onClick={(e) => e.stopPropagation()} className="font-bold text-gray-800 bg-gray-50 border border-teal-200 rounded px-2 py-1 outline-none w-full" />) : (<h3 className="font-bold text-gray-800 truncate group-hover:text-teal-600 transition-colors">{project.title}</h3>)}
                    <div className="flex items-center gap-2 mt-1"><span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">Whiteboard</span></div>
                </div>
                <div className={`${isMobile ? 'opacity-100' : 'md:opacity-0 group-hover:opacity-100'} transition-opacity flex items-center gap-1 z-50`} onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleStar(project.id); }} className={`p-2 rounded-full transition-colors ${project.starred ? 'text-yellow-400 bg-yellow-50' : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'}`}><Star size={18} fill={project.starred ? "currentColor" : "none"} /></button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsRenaming(true); }} className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"><Edit2 size={16} /></button>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project.id); }} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
                </div>
            </div>
        );
    }
    return (
        <div onClick={onClick} className="group relative bg-white rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col border border-gray-100 isolate">
            <div className={`aspect-[16/10] ${project.thumbnail} m-2 rounded-[1.5rem] relative overflow-hidden p-6 flex items-center justify-center`}>
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 pointer-events-none">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-teal-600"><PenTool size={36} /></div>
                </div>
            </div>
            <div className="px-5 pb-5 pt-2 flex-1 flex flex-col justify-between relative">
                <div>
                     {isRenaming ? (<input ref={inputRef} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()} onBlur={() => handleSaveRename()} onClick={(e) => e.stopPropagation()} className="font-bold text-lg text-gray-900 bg-gray-50 border border-teal-200 rounded px-2 py-0.5 outline-none w-full" />) : (<h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-teal-600 transition-colors line-clamp-1">{project.title}</h3>)}
                    <p className="text-xs text-gray-400 font-medium">{project.date}</p>
                </div>
            </div>
             <div 
                className={`absolute bottom-4 right-4 flex items-center gap-1 z-[100] ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                onMouseDown={(e) => { e.stopPropagation(); }}
            >
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleStar(project.id); }} onMouseDown={(e) => e.stopPropagation()} className={`p-2 rounded-full transition-colors ${project.starred ? 'text-yellow-400 bg-yellow-50' : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'}`} title="Star"><Star size={18} fill={project.starred ? "currentColor" : "none"} className="pointer-events-none" /></button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsRenaming(true); }} onMouseDown={(e) => e.stopPropagation()} className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Rename"><Edit2 size={16} className="pointer-events-none" /></button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project.id); }} onMouseDown={(e) => e.stopPropagation()} className="p-2 text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors shadow-sm" title="Delete"><Trash2 size={16} className="pointer-events-none" /></button>
            </div>
        </div>
    );
};

const SettingsToggle = ({ label, active, onClick, icon: Icon, description }: { label: string, active: boolean, onClick: () => void, icon?: any, description?: string }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal-200 transition-colors cursor-pointer group select-none" onClick={onClick}>
        <div className="flex items-center gap-4">
            {Icon && <div className={`p-2.5 rounded-xl transition-colors ${active ? 'bg-teal-100 text-teal-600' : 'bg-white text-gray-400 group-hover:text-teal-600 shadow-sm border border-gray-100'}`}><Icon size={20} /></div>}
            <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-sm">{label}</span>
                {description && <span className="text-xs text-gray-400">{description}</span>}
            </div>
        </div>
        <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${active ? 'bg-teal-600' : 'bg-gray-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
    </div>
);

const SettingsSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider px-1">{title}</h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectMode, onOpenProject, onDeleteProject, onRenameProject, onToggleStar, isMobile }) => {
    const [activeTab, setActiveTab] = useState<TabType>('HOME');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    
    // Config States
    const [darkMode, setDarkMode] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('pixelia_dark_mode') === 'true' : false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('pixelia_notifications') !== 'false' : true);
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [showRulers, setShowRulers] = useState(true);
    const [currentLang, setCurrentLang] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('pixelia_language') || 'en' : 'en');
    
    useEffect(() => { localStorage.setItem('pixelia_dark_mode', String(darkMode)); }, [darkMode]);
    useEffect(() => { localStorage.setItem('pixelia_notifications', String(notificationsEnabled)); }, [notificationsEnabled]);
    useEffect(() => { localStorage.setItem('pixelia_language', currentLang); }, [currentLang]);

    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];

    const filteredProjects = useMemo(() => {
        let currentProjects = projects;
        if (activeTab === 'STARRED') currentProjects = currentProjects.filter(p => p.starred);
        if (!searchQuery) return currentProjects;
        return currentProjects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, activeTab, projects]);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 px-3 mb-12">
                <div className="w-14 h-14 shadow-lg shadow-teal-500/20 rounded-2xl overflow-hidden animate-heartbeat"><PixeliaLogo className="w-full h-full" /></div>
                <span className={`font-black text-3xl tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pixelia</span>
            </div>
            <div className="space-y-4">
                <SidebarItem icon={Home} label={t.home} active={activeTab === 'HOME'} onClick={() => { setActiveTab('HOME'); setShowSidebar(false); }} />
                <SidebarItem icon={FolderOpen} label={t.projects} active={activeTab === 'PROJECTS'} onClick={() => { setActiveTab('PROJECTS'); setShowSidebar(false); }} />
                <SidebarItem icon={Star} label={t.starred} active={activeTab === 'STARRED'} onClick={() => { setActiveTab('STARRED'); setShowSidebar(false); }} />
            </div>
            
            <div className={`mt-auto pt-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <SidebarItem icon={Settings} label={t.settings} active={activeTab === 'SETTINGS'} onClick={() => { setActiveTab('SETTINGS'); setShowSidebar(false); }} />
            </div>
        </div>
    );

    return (
        <div className={`flex h-screen w-full transition-colors duration-500 font-sans overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-[#F3F4F6] text-gray-900'}`}>
            {showSidebar && (<div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setShowSidebar(false)} />)}
            
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] flex-shrink-0 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-transparent border-gray-200'} lg:border-none h-full overflow-y-auto custom-scrollbar p-6 lg:p-8 flex flex-col`}>
                <SidebarContent />
            </aside>

            <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative px-6 py-6 lg:px-12 lg:py-10">
                <div className="flex items-center justify-between mb-8 md:mb-12 gap-4 sticky top-0 z-40 py-2 -my-2 bg-gradient-to-b from-[var(--bg-color)] to-transparent">
                    <button onClick={() => setShowSidebar(true)} className="p-3 bg-white rounded-2xl shadow-sm lg:hidden hover:bg-gray-50"><Menu size={22} className="text-gray-700" /></button>
                    {activeTab !== 'SETTINGS' ? (
                         <div className="relative flex-1 max-w-2xl group animate-in slide-in-from-top-4 duration-500">
                            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search_placeholder} className={`w-full ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-white text-gray-900'} rounded-[20px] py-3.5 md:py-4 pl-12 md:pl-14 pr-4 text-sm md:text-base font-semibold transition-all outline-none border border-transparent focus:border-teal-200 focus:shadow-lg focus:shadow-teal-500/10 shadow-sm`} />
                        </div>
                    ) : (
                        <h1 className="text-3xl font-black tracking-tight animate-in slide-in-from-left-4">{t.settings}</h1>
                    )}
                   
                    <div className="relative">
                        <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-3 md:p-4 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-gray-500'} rounded-2xl shadow-sm border hover:scale-105 transition-transform`}>
                            <Bell size={isMobile ? 20 : 22} />
                            {notifications.some(n => !n.read) && <span className="absolute top-3 right-3 md:top-4 md:right-4 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>}
                        </button>
                        
                        {showNotifications && (
                            <div className={`absolute right-0 top-full mt-4 w-80 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'} rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold">{t.notifications}</h3>
                                    <button className="text-xs text-teal-600 font-bold hover:underline">{t.mark_all_read}</button>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm">{t.no_new_notifications}</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`p-3 rounded-xl flex gap-3 transition-colors ${n.read ? 'bg-transparent' : (darkMode ? 'bg-teal-900/20' : 'bg-teal-50')}`}>
                                                <div className="w-2 h-2 mt-2 bg-teal-500 rounded-full flex-shrink-0" />
                                                <div>
                                                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{n.title}</p>
                                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{n.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2">{n.time}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {activeTab === 'SETTINGS' ? (
                    <div className="max-w-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
                        {/* Profile Section */}
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-[2rem] shadow-sm border`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#1e3a8a] to-[#14b8a6] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-500/30">JD</div>
                                <div>
                                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>John Doe</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-gray-400 text-sm">john.doe@example.com</span>
                                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span className="text-xs font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">{t.pro_member}</span>
                                    </div>
                                </div>
                                <button className="ml-auto text-teal-600 font-bold text-sm hover:bg-teal-50 px-4 py-2 rounded-xl transition-colors">{t.edit_profile}</button>
                            </div>
                        </div>

                        {/* Settings Groups */}
                        <SettingsSection title="Appearance">
                            <SettingsToggle 
                                label={t.dark_mode} 
                                description="Switch between light and dark themes" 
                                active={darkMode} 
                                onClick={() => setDarkMode(!darkMode)} 
                                icon={darkMode ? Moon : Sun} 
                            />
                            
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 group-hover:text-teal-600 transition-colors"><Globe size={20} /></div>
                                    <span className="font-bold text-gray-800 text-sm">{t.language}</span>
                                </div>
                                <div className="relative">
                                    <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:border-teal-300 transition-colors">
                                        <span>{LANGUAGES.find(l => l.code === currentLang)?.flag}</span>
                                        <span>{LANGUAGES.find(l => l.code === currentLang)?.label}</span>
                                        <ChevronDown size={14} className="text-gray-400" />
                                    </button>
                                    {showLanguageMenu && (
                                        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95">
                                            {LANGUAGES.map(lang => (
                                                <button 
                                                    key={lang.code}
                                                    onClick={() => { setCurrentLang(lang.code); setShowLanguageMenu(false); }}
                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 text-left transition-colors"
                                                >
                                                    <span>{lang.flag}</span>
                                                    <span className={currentLang === lang.code ? 'font-bold text-teal-600' : 'text-gray-600'}>{lang.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SettingsSection>

                        <SettingsSection title="Editor Preferences">
                            <SettingsToggle 
                                label="Snap to Objects" 
                                description="Align elements automatically when moving" 
                                active={snapToGrid} 
                                onClick={() => setSnapToGrid(!snapToGrid)} 
                                icon={Magnet} 
                            />
                            <SettingsToggle 
                                label="Show Rulers" 
                                description="Display horizontal and vertical rulers" 
                                active={showRulers} 
                                onClick={() => setShowRulers(!showRulers)} 
                                icon={Ruler} 
                            />
                            <SettingsToggle 
                                label="Grid Background" 
                                description="Default new boards to grid pattern" 
                                active={true} 
                                onClick={() => {}} 
                                icon={LayoutTemplate} 
                            />
                        </SettingsSection>

                        <SettingsSection title="Notifications">
                            <SettingsToggle 
                                label="Push Notifications" 
                                description="Receive alerts about activity on your boards" 
                                active={notificationsEnabled} 
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)} 
                                icon={Smartphone} 
                            />
                            <SettingsToggle 
                                label="Email Updates" 
                                description="Weekly digest and product updates" 
                                active={emailAlerts} 
                                onClick={() => setEmailAlerts(!emailAlerts)} 
                                icon={Mail} 
                            />
                        </SettingsSection>

                        <SettingsSection title="System">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md hover:border-teal-100 transition-all text-left group">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 group-hover:text-blue-500 shadow-sm"><Info size={18} /></div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm">Version 2.4.0</div>
                                        <div className="text-xs text-gray-400">Up to date</div>
                                    </div>
                                </button>
                                <button className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md hover:border-teal-100 transition-all text-left group">
                                    <div className="p-2 bg-white rounded-lg text-gray-400 group-hover:text-purple-500 shadow-sm"><HelpCircle size={18} /></div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm">Help Center</div>
                                        <div className="text-xs text-gray-400">FAQs & Support</div>
                                    </div>
                                </button>
                            </div>
                            
                            <button className="w-full p-4 mt-2 flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-2xl transition-colors">
                                <LogOut size={18} />
                                {t.log_out}
                            </button>
                        </SettingsSection>
                    </div>
                ) : (
                    <div className="space-y-10 pb-20">
                        {activeTab === 'HOME' && !searchQuery && (
                            <div onClick={() => onSelectMode('FREEHAND')} className="group relative h-[240px] md:h-[320px] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white cursor-pointer animate-fade-in shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 hover:scale-[1.01] border-4 border-white">
                                {/* Brand Gradient Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#0ea5e9] to-[#14b8a6] transition-opacity" />
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                                
                                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="mb-4 md:mb-6 p-4 md:p-5 bg-white/10 backdrop-blur-md rounded-3xl animate-float shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] border border-white/20">
                                      <Plus size={isMobile ? 32 : 48} className="text-white drop-shadow-md" />
                                    </div>
                                    <h2 className="text-4xl md:text-7xl font-black text-white mb-3 tracking-tight group-hover:scale-105 transition-transform duration-300 drop-shadow-sm">{t.create_new}</h2>
                                    <p className="text-base md:text-xl text-teal-50 font-medium group-hover:text-white transition-colors">{t.create_subtitle}</p>
                                </div>
                            </div>
                        )}
                        <section className="animate-slide-up stagger-3">
                            {/* ... Project List ... */}
                             <div className="flex items-center justify-between mb-8 px-2">
                                <h2 className={`text-xl md:text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>{searchQuery ? `${t.results_for} "${searchQuery}"` : activeTab === 'PROJECTS' ? t.projects : t.recent_designs}</h2>
                                <div className={`flex ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-1 rounded-xl border shadow-sm`}>
                                    <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? (darkMode ? 'bg-gray-700 text-white shadow-inner' : 'bg-gray-100 text-gray-900 shadow-inner') : 'text-gray-400 hover:text-gray-600'}`}><Grid size={16} /></button>
                                    <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? (darkMode ? 'bg-gray-700 text-white shadow-inner' : 'bg-gray-100 text-gray-900 shadow-inner') : 'text-gray-400 hover:text-gray-600'}`}><List size={16} /></button>
                                </div>
                            </div>
                            {/* ... Render Projects ... */}
                            {filteredProjects.length === 0 ? (
                                <div className={`py-20 text-center text-gray-400 font-bold ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-[2rem] md:rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center gap-4`}>
                                    <div className={`w-16 h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-full flex items-center justify-center`}><FolderOpen size={32} className="opacity-20" /></div>
                                    {t.no_projects}
                                </div>
                            ) : (
                                <div className={viewMode === 'GRID' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" : "flex flex-col gap-3"}>
                                    {filteredProjects.map((project) => (<ProjectCard key={project.id} project={project} onClick={() => onOpenProject(project)} onDelete={onDeleteProject} onRename={onRenameProject} onToggleStar={onToggleStar} viewMode={viewMode} t={t} isMobile={isMobile} />))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
