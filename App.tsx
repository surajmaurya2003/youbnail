
import React, { useState, useEffect, useRef, useCallback, useMemo, memo, type ComponentType, type SVGProps } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { CreationMode, UserProfile, GeneratedThumbnail, PlanTier, GenerationOptions, SelectionArea, AspectRatio, UsageRecord } from './types';
import { 
  HomeIcon,
  SparklesIcon,
  PhotoIcon, 
  Squares2X2Icon, 
  CurrencyDollarIcon, 
  UserCircleIcon, 
  ChartBarSquareIcon, 
  CreditCardIcon, 
  LifebuoyIcon,
  AdjustmentsHorizontalIcon,
  ScissorsIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  AtSymbolIcon,
  BoltIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GallerySkeleton, UsageTableSkeleton, ProfileSkeleton, SpinnerLoader } from './components/LoadingStates';
import { TEMPLATES, PLANS, UPCOMING_TOOLS, THEMES, Theme, SHOWCASE_IMAGES } from './constants';
import { ThumbnailAI } from './services/geminiService';
import { ImageEditor } from './components/ImageEditor';
import { VideoSnapshot } from './components/VideoSnapshot';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { securityMonitor } from './lib/security';
import { getEnvironmentInfo } from './lib/config';
import { Landing } from './components/Landing';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { RefundPolicy } from './components/RefundPolicy';
import { authService, userService, thumbnailsService, usageService, storageService } from './services/supabaseService';
import { supabase } from './lib/supabase';
import Pricing_04 from './components/ui/ruixen-pricing-04';
import { ToastProvider, useToast } from './components/ui/toast';
import { AlertModal, ConfirmModal, Modal } from './components/ui/modal';
import { useModal } from './components/ui/use-modal';
import { NotificationsPanel } from './components/NotificationsPanel';


const AppWithToast: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { 
    alertModal,
    confirmModal,
    showAlert,
    showConfirm,
    closeAlert,
    closeConfirm,
    showSuccess: showSuccessModal,
    showError: showErrorModal,
    showWarning: showWarningModal,
    showInfo: showInfoModal
  } = useModal();

  
  // Map paths to tabs (paths are relative to basename="/")
  const pathToTab: Record<string, 'home' | 'create' | 'gallery' | 'plans' | 'profile' | 'usage' | 'billing' | 'support'> = {
    '/': 'home',
    '/home': 'home',
    '/create': 'create',
    '/studio': 'create',
    '/gallery': 'gallery',
    '/pricing': 'plans',
    '/plans': 'plans',
    '/profile': 'profile',
    '/usage': 'usage',
    '/billing': 'billing',
    '/support': 'support'
  };
  
  // Get initial tab from URL
  const getTabFromPath = (path: string): 'home' | 'create' | 'gallery' | 'plans' | 'profile' | 'usage' | 'billing' | 'support' => {
    return pathToTab[path] || 'home';
  };
  
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'gallery' | 'plans' | 'profile' | 'usage' | 'billing' | 'support'>(getTabFromPath(location.pathname));
  const [mode, setMode] = useState<CreationMode>(CreationMode.PROMPT);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<GenerationOptions>({
    overlayText: '',
    style: 'Cinematic',
    lighting: 'Dramatic',
    emphasis: 'High Contrast',
    aspectRatio: '16:9'
  });
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [currentAfterImageIndex, setCurrentAfterImageIndex] = useState(0);
  
  const [refImage, setRefImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedThumb, setGeneratedThumb] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedThumbnail[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  
  // Generation tracking and notifications
  const [activeGenerations, setActiveGenerations] = useState<Map<string, {
    id: string;
    prompt: string;
    progress: number;
    status: 'generating' | 'completed' | 'failed';
    result?: string;
    error?: string;
    startTime: number;
  }>>(new Map());
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  const [showMockup, setShowMockup] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedArea, setSelectedArea] = useState<SelectionArea | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('annually');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<string | null>(null); // Track which plan is being updated
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [lastGenerateTime, setLastGenerateTime] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [shareModalUrl, setShareModalUrl] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Current generation tracking
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);
  const [skeletonPrompt, setSkeletonPrompt] = useState<string>('');
  
  // Track the current user ID to prevent resetting edit fields unnecessarily
  const currentUserIdRef = useRef<string | null>(null);
  const editFieldsInitializedRef = useRef<boolean>(false);
  const authInitializedRef = useRef<boolean>(false);
  const overlayTextRef1 = useRef<HTMLInputElement>(null);
  const overlayTextRef2 = useRef<HTMLInputElement>(null);
  const editPromptRef = useRef<HTMLInputElement>(null);
  const editNameRef = useRef<HTMLInputElement>(null);
  const editEmailRef = useRef<HTMLInputElement>(null);
  const promptRef1 = useRef<HTMLTextAreaElement>(null);
  const promptRef2 = useRef<HTMLTextAreaElement>(null);
  const refUploadInputRef = useRef<HTMLInputElement>(null);

  // Skeleton Preview Component
  const SkeletonPreview: React.FC<{ prompt: string; progress: number }> = ({ prompt, progress }) => {
    const [shimmerPosition, setShimmerPosition] = useState(0);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setShimmerPosition(prev => (prev + 1) % 3);
      }, 800);
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden border" 
           style={{borderColor: 'var(--border-primary)', background: 'var(--bg-card)', aspectRatio: options.aspectRatio === '9:16' ? '9/16' : '16/9'}}>        
        {/* Base skeleton */}
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'}}>
          {/* Animated gradient overlay */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(45deg, 
                transparent 0%, 
                transparent ${shimmerPosition * 30}%, 
                rgba(239, 68, 68, 0.1) ${shimmerPosition * 30 + 10}%, 
                rgba(239, 68, 68, 0.2) ${shimmerPosition * 30 + 20}%, 
                rgba(239, 68, 68, 0.1) ${shimmerPosition * 30 + 30}%, 
                transparent ${shimmerPosition * 30 + 40}%, 
                transparent 100%)
              `,
              animation: 'skeleton-pulse 2s ease-in-out infinite'
            }}
          />
          
          {/* Content placeholder blocks */}
          <div className="absolute inset-4 flex flex-col justify-between">
            {/* Top elements */}
            <div className="flex justify-between items-start">
              <div className="w-20 h-6 rounded" style={{background: 'rgba(239, 68, 68, 0.15)'}} />
              <div className="w-16 h-4 rounded" style={{background: 'rgba(239, 68, 68, 0.1)'}} />
            </div>
            
            {/* Center elements */}
            <div className="text-center space-y-3">
              <div className="mx-auto w-32 h-8 rounded" style={{background: 'rgba(239, 68, 68, 0.2)'}} />
              <div className="mx-auto w-24 h-4 rounded" style={{background: 'rgba(239, 68, 68, 0.1)'}} />
            </div>
            
            {/* Bottom elements */}
            <div className="flex justify-between items-end">
              <div className="w-24 h-5 rounded" style={{background: 'rgba(239, 68, 68, 0.12)'}} />
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full" style={{background: 'rgba(239, 68, 68, 0.3)'}} />
                <div className="w-3 h-3 rounded-full" style={{background: 'rgba(239, 68, 68, 0.2)'}} />
                <div className="w-3 h-3 rounded-full" style={{background: 'rgba(239, 68, 68, 0.15)'}} />
              </div>
            </div>
          </div>
          
          {/* Generation info overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4" style={{background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'}}>
            <div className="text-center space-y-2">
              <div className="text-xs font-medium" style={{color: 'var(--text-secondary)'}}>
                Generating: {prompt}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs" style={{color: 'var(--text-muted)'}}>
                <div className="animate-pulse">●</div>
                AI is creating your thumbnail...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Initialize auth and load user data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          // Check if user profile exists, create if not (for OAuth users)
          let userProfile = await userService.getUserProfile(currentUser.id);
          if (!userProfile) {
            // Create profile for OAuth users
            const name = currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User';
            await userService.updateUserProfile(currentUser.id, {
              id: currentUser.id,
              email: currentUser.email!,
              name: name,
              credits: 0,
              plan: 'free',
            });
            userProfile = await userService.getUserProfile(currentUser.id);
          }
          
          if (userProfile) {
            setUser(userProfile);
            // Only update edit fields if this is a new user or they haven't been initialized
            if (currentUserIdRef.current !== currentUser.id || !editFieldsInitializedRef.current) {
              setEditName(userProfile.name);
              setEditEmail(userProfile.email);
              // Update refs for uncontrolled inputs
              if (editNameRef.current) editNameRef.current.value = userProfile.name || '';
              if (editEmailRef.current) editEmailRef.current.value = userProfile.email || '';
              currentUserIdRef.current = currentUser.id;
              editFieldsInitializedRef.current = true;
            }
            setIsAuthenticated(true);
            
            // Check Google link status
            try {
              const googleLinked = await authService.isGoogleLinked();
              setIsGoogleLinked(googleLinked);
            } catch (error) {
              console.error('Error checking authentication status');
            }
            
            // Load thumbnails and usage history
        const [thumbnails, usageRecords] = await Promise.all([
              thumbnailsService.getUserThumbnails(currentUser.id),
              usageService.getUserUsageRecords(currentUser.id)
            ]);
            setHistory(thumbnails);
            setUsageHistory(usageRecords);
          }
          // Mark as initialized to prevent duplicate calls from auth state change
          authInitializedRef.current = true;
        }
      } catch (error) {
        console.error('Authentication initialization failed');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
      // Skip if we just initialized (to prevent duplicate initialization)
      if (authInitializedRef.current && user && currentUserIdRef.current === user.id) {
        return;
      }
      
      if (user) {
        // Check if user profile exists, create if not (for OAuth users)
        let userProfile = await userService.getUserProfile(user.id);
        if (!userProfile) {
          // Create profile for OAuth users
          const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
          await userService.updateUserProfile(user.id, {
            id: user.id,
            email: user.email!,
            name: name,
            credits: 10,
            plan: 'starter',
          });
          userProfile = await userService.getUserProfile(user.id);
        }
        
        if (userProfile) {
          setUser(userProfile);
          // Only update edit fields if this is a new user or they haven't been initialized
          if (currentUserIdRef.current !== user.id || !editFieldsInitializedRef.current) {
            setEditName(userProfile.name);
            setEditEmail(userProfile.email);
            // Update refs for uncontrolled inputs
            if (editNameRef.current) editNameRef.current.value = userProfile.name || '';
            if (editEmailRef.current) editEmailRef.current.value = userProfile.email || '';
            currentUserIdRef.current = user.id;
            editFieldsInitializedRef.current = true;
          }
          setIsAuthenticated(true);
          
          // Load data with loading states
          setIsLoadingGallery(true);
          setIsLoadingUsage(true);
          
          const [thumbnails, usageRecords] = await Promise.all([
            thumbnailsService.getUserThumbnails(user.id),
            usageService.getUserUsageRecords(user.id)
          ]);
          
          setHistory(thumbnails);
          setUsageHistory(usageRecords);
          setIsLoadingGallery(false);
          setIsLoadingUsage(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        currentUserIdRef.current = null;
        editFieldsInitializedRef.current = false;
        authInitializedRef.current = false;
        setHistory([]);
        setUsageHistory([]);
        setIsLoadingGallery(false);
        setIsLoadingUsage(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle payment success/cancel redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      // Payment successful - webhook will update the plan
      showSuccess('Payment Successful!', 'Your plan is being updated...');
      // Clean up URL
      window.history.replaceState({}, '', '/pricing');
      // Refresh user data multiple times to ensure webhook has processed
      let attempts = 0;
      const maxAttempts = 10;
      const refreshInterval = setInterval(async () => {
        attempts++;
        if (user && attempts <= maxAttempts) {
          try {
            const updatedProfile = await userService.getUserProfile(user.id);
            if (updatedProfile && (updatedProfile.credits > 0 || updatedProfile.plan !== 'free')) {
              setUser(updatedProfile);
              clearInterval(refreshInterval);
              showSuccess('Plan Updated!', `Welcome to ${updatedProfile.plan}! You now have ${updatedProfile.credits} credits.`);
            } else if (attempts === maxAttempts) {
              clearInterval(refreshInterval);
              showWarning('Update Pending', 'Your payment was successful but the plan update is taking longer than expected. Please refresh the page in a few minutes or contact support if the issue persists.');
            }
          } catch (error) {
            console.error('Error refreshing user profile:', error);
            if (attempts === maxAttempts) {
              clearInterval(refreshInterval);
              showError('Update Issue', 'There was an issue updating your plan. Please contact support with your session ID: ' + sessionId);
            }
          }
        } else {
          clearInterval(refreshInterval);
        }
      }, 2000); // Check every 2 seconds
    } else if (canceled === 'true') {
      showInfo('Payment Canceled', 'No charges were made.');
      // Clean up URL
      window.history.replaceState({}, '', '/pricing');
    }
  }, [user]);

  // Rotate through after images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAfterImageIndex((prev) => (prev + 1) % SHOWCASE_IMAGES.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Cleanup old completed generations after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGenerations(prev => {
        const updated = new Map(prev);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        
        for (const [id, generation] of updated.entries()) {
          if ((generation as any).status !== 'generating' && (generation as any).startTime < fiveMinutesAgo) {
            updated.delete(id);
          }
        }
        
        return updated.size === prev.size ? prev : updated;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Sync URL with activeTab (only when authenticated and in AppContent)
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const tabFromPath = getTabFromPath(location.pathname);
    setActiveTab(prevTab => {
      if (tabFromPath !== prevTab) {
        return tabFromPath;
      }
      return prevTab;
    });
  }, [location.pathname, isAuthenticated, user]);


  // Helper function to change tab and navigate
  const navigateToTab = useCallback((tab: 'home' | 'create' | 'gallery' | 'plans' | 'profile' | 'usage' | 'billing' | 'support') => {
    setActiveTab(tab);
    const tabToPath: Record<string, string> = {
      'home': '/',
      'create': '/create',
      'gallery': '/gallery',
      'plans': '/pricing',
      'profile': '/profile',
      'usage': '/usage',
      'billing': '/billing',
      'support': '/support'
    };
    navigate(tabToPath[tab] || '/');
  }, [navigate]);

  const handleGenerate = async (isPartialUpdate: boolean = false) => {
    if (!user) {
      showErrorModal("Authentication Required", "Please sign in to generate thumbnails.");
      return;
    }

    // Ensure user has valid session before making API calls
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        showErrorModal("Authentication Error", "Your session has expired. Please sign in again.");
        return;
      }
    } catch (error) {
      showErrorModal("Authentication Error", "Unable to verify session. Please refresh and try again.");
      return;
    }

    // Client-side rate limiting: 3 seconds cooldown between generations
    const now = Date.now();
    const RATE_LIMIT_COOLDOWN = 3000; // 3 seconds
    if (now - lastGenerateTime < RATE_LIMIT_COOLDOWN) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_COOLDOWN - (now - lastGenerateTime)) / 1000);
      setIsRateLimited(true);
      showWarning('Please Wait', `Please wait ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''} before generating another thumbnail.`);
      setTimeout(() => setIsRateLimited(false), remainingSeconds * 1000);
      return;
    }
    setLastGenerateTime(now);

    // Free users must choose a plan first
    if (user.plan === 'free') {
      alert("Please choose a plan to continue generating thumbnails.");
      navigateToTab('plans');
      return;
    }

    if (isPartialUpdate && user.plan === 'starter') {
      alert("Selective Editing is a Pro feature. Please upgrade your plan.");
      navigateToTab('plans');
      return;
    }

    if (user.credits <= 0) {
      alert("You've run out of credits!");
      navigateToTab('plans');
      return;
    }

    const currentPrompt = isPartialUpdate 
      ? (editPromptRef.current?.value || '') 
      : (promptRef1.current?.value || promptRef2.current?.value || prompt);
    const baseImg = isPartialUpdate ? generatedThumb : refImage;

    if (!currentPrompt && !baseImg) {
      alert("Please provide a description or a base image.");
      return;
    }

    // SECURITY: Input validation
    if (currentPrompt) {
      // Validate prompt length
      if (currentPrompt.length > 2000) {
        alert("Prompt is too long. Maximum 2000 characters allowed.");
        return;
      }
      
      // Basic sanitization (additional protection)
      const sanitizedPrompt = currentPrompt.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      if (sanitizedPrompt.length !== currentPrompt.length) {
        alert("Invalid characters detected in prompt. Please remove any script tags.");
        return;
      }
    }

    // Validate overlay text if provided
    if (options.overlayText && options.overlayText.length > 100) {
      alert("Overlay text is too long. Maximum 100 characters allowed.");
      return;
    }

    // Create generation ID and track it
    const generationId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const currentPromptText = isPartialUpdate 
      ? `Modified: ${editPromptRef.current?.value || ''}` 
      : (promptRef1.current?.value || promptRef2.current?.value || prompt || "Amazing YouTube Thumbnail");
    
    setCurrentGenerationId(generationId);
    setSkeletonPrompt(currentPromptText);
    setIsGenerating(true);
    setGenerationProgress(5); // Start at 5% when generation begins
    setGeneratedThumb(null);
    
    // Add to active generations for notification tracking
    setActiveGenerations(prev => new Map(prev.set(generationId, {
      id: generationId,
      prompt: currentPromptText,
      progress: 5,
      status: 'generating',
      startTime: Date.now()
    })));
    
    // Realistic progress simulation - only during AI generation
    // This simulates the actual generation time (typically 10-30 seconds)
    const startTime = Date.now();
    const estimatedGenerationTime = 20000; // 20 seconds average (will adjust based on actual time)
    
    const simulateRealisticProgress = () => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        // Progress from 5% to 95% during generation
        // Use a logarithmic curve for more realistic feel (slower at start, faster in middle)
        const progressRatio = Math.min(elapsed / estimatedGenerationTime, 0.95);
        const progress = 5 + (progressRatio * 90); // 5% to 95%
        const roundedProgress = Math.min(Math.round(progress), 95);
        setGenerationProgress(roundedProgress);
        
        // Update notification progress
        setActiveGenerations(prev => {
          const updated = new Map(prev);
          const gen = updated.get(generationId);
          if (gen) {
            updated.set(generationId, { ...(gen as any), progress: roundedProgress });
          }
          return updated;
        });
      }, 500); // Update every 500ms for smoother progress
      return interval;
    };
    
    const progressInterval = simulateRealisticProgress();
    
    try {
      // Read overlayText from refs if available, otherwise use state
      const overlayTextValue = overlayTextRef1.current?.value || overlayTextRef2.current?.value || options.overlayText;
      const currentOptions = {
        ...options,
        overlayText: overlayTextValue
      };
      
      // Start AI generation - this is where progress should be tracked
      const result = await ThumbnailAI.generateThumbnail(
        currentPromptText || "Amazing YouTube Thumbnail", 
        baseImg || undefined, 
        currentOptions,
        isPartialUpdate ? selectedArea : null
      );
      
      // Generation complete - jump to 100%
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Update notification status
      setActiveGenerations(prev => {
        const updated = new Map(prev);
        const gen = updated.get(generationId);
        if (gen) {
          updated.set(generationId, { ...(gen as any), progress: 100, status: 'completed', result });
        }
        return updated;
      });
      
      // Show image immediately - don't wait for upload (better UX)
      setGeneratedThumb(result);
      
      // Optimized base64 to blob conversion (no network fetch needed - faster)
      const convertBase64ToBlob = (base64Data: string): Blob => {
        const base64String = base64Data.split(',')[1] || base64Data;
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: 'image/png' });
      };
      
      // Background upload with retry logic (production-ready for 100-1000+ users)
      const uploadWithRetry = async (file: File, retries = 3): Promise<{ url: string; path: string }> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            return await storageService.uploadThumbnail(user.id, file);
          } catch (error) {
            console.warn(`Upload attempt ${attempt}/${retries} failed`);
            if (attempt === retries) throw error;
            // Exponential backoff: wait 1s, 2s, 4s (prevents server overload)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
          }
        }
        throw new Error('Upload failed after retries');
      };
      
      // Start background upload (non-blocking - user sees image immediately)
      // No progress updates here - generation is done, user sees image
      let storagePath = '';
      let publicUrl = result; // Use base64 as fallback (download works immediately)
      const uploadPromise = (async () => {
        if (result.startsWith('data:image')) {
          try {
            const blob = convertBase64ToBlob(result);
            const file = new File([blob], `thumbnail-${Date.now()}.png`, { type: 'image/png' });
            
            const uploadResult = await uploadWithRetry(file);
            publicUrl = uploadResult.url;
            storagePath = uploadResult.path;
            
            // Update the generated thumb URL if upload succeeds (seamless transition)
            setGeneratedThumb(publicUrl);
          } catch (error) {
            console.error('Background upload failed');
            // Continue with base64 URL - user can still download and use image
            // Upload will retry in background or user can regenerate
          }
        }
      })();
      
      // Wait for upload to complete before saving to DB (but UI already shows image)
      await uploadPromise;
      
      // Parallelize database operations for better performance (production optimization)
      const [savedThumb, usageRecord] = await Promise.all([
        thumbnailsService.saveThumbnail(
          user.id,
          {
            url: publicUrl,
            prompt: currentPromptText,
          },
          storagePath,
          options.aspectRatio || '16:9'
        ),
        usageService.saveUsageRecord(user.id, {
          type: isPartialUpdate ? 'edit' : 'generation',
          mode: mode,
          aspectRatio: options.aspectRatio || '16:9',
          credits: 1,
          prompt: currentPromptText || undefined
        })
      ]);
      
      // Update credits asynchronously (non-blocking, with retry for production resilience)
      const newCredits = user.credits - 1;
      userService.updateCredits(user.id, newCredits).catch(error => {
        console.error('Failed to update user credits');
        // Retry once after delay (handles transient network issues)
        setTimeout(() => {
          userService.updateCredits(user.id, newCredits).catch(err => {
            console.error('Credit update retry failed');
            // Could implement queue system for critical operations in production
          });
        }, 2000);
      });
      setUser(prev => prev ? { ...prev, credits: newCredits } : null);
      
      // Update local state
      setHistory([savedThumb, ...history]);
      setUsageHistory([usageRecord, ...usageHistory]);
      
      if (isPartialUpdate) {
        setIsEditMode(false);
        setSelectedArea(null);
        setEditPrompt('');
      }
      
      // Hide progress bar after completion (don't reset to 0%)
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        setCurrentGenerationId(null);
      }, 1500);
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Thumbnail generation failed');
      
      // Update notification with error status
      setActiveGenerations(prev => {
        const updated = new Map(prev);
        const gen = updated.get(generationId);
        if (gen) {
          updated.set(generationId, { ...(gen as any), status: 'failed', error: error.message });
        }
        return updated;
      });
      
      // Production-ready error handling with specific messages
      let errorMessage = 'Failed to generate thumbnail. Please try again.';
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('authentication')) {
        errorMessage = 'Authentication failed. Please sign out and sign in again.';
      } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        errorMessage = 'Generation timed out. Please try again with a simpler prompt.';
      } else if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('rate limit')) {
        errorMessage = 'API quota exceeded. Please try again later or upgrade your plan.';
      } else if (error.message?.includes('Requested entity was not found') || error.message?.includes('API key')) {
        errorMessage = 'API configuration issue. Please check your settings.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      alert(errorMessage);
      setGenerationProgress(0);
      setIsGenerating(false);
    }
  };

  const addCredits = async (amount: number) => {
    if (!user) return;
    try {
      const newCredits = user.credits + amount;
      await userService.updateCredits(user.id, newCredits);
      setUser(prev => prev ? ({ ...prev, credits: newCredits }) : null);
      alert(`Successfully added ${amount} credits!`);
    } catch (error) {
      console.error('Failed to add credits');
      alert('Failed to add credits. Please try again.');
    }
  };

  const handleShare = (imageUrl: string) => {
    setShareModalUrl(imageUrl);
    setIsShareModalOpen(true);
  };

  const handleCopyLink = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      showSuccess('Link copied to clipboard!');
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = imageUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showSuccess('Link copied to clipboard!');
    }
  };

  const handleDeleteThumbnail = async (thumbnailId: string, storagePath?: string) => {
    try {
      // Delete from Supabase (storage if available, always from database)
      await thumbnailsService.deleteThumbnail(thumbnailId, storagePath);
      
      // Update local state
      setHistory(prev => prev.filter(item => item.id !== thumbnailId));
      
      showSuccess('Thumbnail deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete thumbnail:', error);
      showError('Failed to delete thumbnail: ' + (error.message || 'Unknown error'));
    }
  };

  const updateOption = useCallback((key: keyof GenerationOptions, value: string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  // Memoize format button handlers to prevent re-renders
  const handleVideoFormatClick = useCallback(() => updateOption('aspectRatio', '16:9'), [updateOption]);
  const handleReelsFormatClick = useCallback(() => updateOption('aspectRatio', '9:16'), [updateOption]);

  // Handlers removed - now using uncontrolled inputs with refs

  const applyTheme = useCallback((theme: Theme) => {
    // Check if clicking the same theme (toggle off)
    if (selectedThemeId === theme.id) {
      // Unselect the theme
      setSelectedThemeId(null);
      
      // Remove this theme's prompt addition
      if (theme.promptAddition) {
        let currentPrompt = prompt.trim();
        currentPrompt = currentPrompt.replace(theme.promptAddition, '').trim();
        // Clean up any double commas or leading/trailing commas
        currentPrompt = currentPrompt.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim();
        setPrompt(currentPrompt);
      }
      
      // Reset style options to defaults
      setOptions(prev => ({
        ...prev,
        style: 'Cinematic',
        lighting: 'Dramatic',
        emphasis: 'High Contrast'
      }));
      
      return;
    }
    
    // Apply the new theme
    setOptions(prev => ({
      ...prev,
      style: theme.style,
      lighting: theme.lighting,
      emphasis: theme.emphasis
    }));
    
    // Track selected theme
    setSelectedThemeId(theme.id);
    
    if (theme.promptAddition) {
      let currentPrompt = prompt.trim();
      
      // Get all theme prompt additions
      const themeAdditions = THEMES.map(t => t.promptAddition).filter(Boolean) as string[];
      
      // Remove any existing theme additions from the prompt
      themeAdditions.forEach(addition => {
        // Remove exact match
        currentPrompt = currentPrompt.replace(addition, '').trim();
        // Clean up any double commas or leading/trailing commas
        currentPrompt = currentPrompt.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim();
      });
      
      // Add the new theme's prompt addition
      if (currentPrompt) {
        setPrompt(`${currentPrompt}, ${theme.promptAddition}`);
      } else {
        setPrompt(theme.promptAddition);
      }
    } else {
      // If theme has no promptAddition, remove any existing theme additions
      let currentPrompt = prompt.trim();
      const themeAdditions = THEMES.map(t => t.promptAddition).filter(Boolean) as string[];
      
      themeAdditions.forEach(addition => {
        currentPrompt = currentPrompt.replace(addition, '').trim();
        currentPrompt = currentPrompt.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim();
      });
      
      setPrompt(currentPrompt);
    }
  }, [prompt, selectedThemeId]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const nameValue = editNameRef.current?.value || '';
    const emailValue = editEmailRef.current?.value || '';
    
    try {
      await userService.updateUserProfile(user.id, {
        name: nameValue,
        email: emailValue,
      });
      setUser(prev => prev ? { ...prev, name: nameValue, email: emailValue } : null);
      alert('Profile updated!');
    } catch (error) {
      console.error('Profile update failed');
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleReferenceFile = (file?: File | null) => {
    if (!file) return;
    const maxBytes = 10 * 1024 * 1024;
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!isImage) {
      alert('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > maxBytes) {
      alert('Image is too large. Max 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setRefImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const triggerRefUpload = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Use setTimeout to ensure the click happens after any event bubbling
    setTimeout(() => {
      if (refUploadInputRef.current) {
        refUploadInputRef.current.click();
      } else {
        // Fallback to getElementById if ref isn't set
        const input = document.getElementById('ref-upload') as HTMLInputElement | null;
        if (input) {
          input.click();
        }
      }
    }, 0);
  }, []);
  
  const handleOverlayTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({ ...prev, overlayText: e.target.value }));
  }, []);
  
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  }, []);
  
  const handleEditPromptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditPrompt(e.target.value);
  }, []);
  
  const handleEditNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  }, []);
  
  const handleEditEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditEmail(e.target.value);
  }, []);

  // Notification panel handlers
  const handleRemoveGeneration = useCallback((id: string) => {
    setActiveGenerations(prev => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  }, []);

  const handleDownloadFromNotification = useCallback(async (imageUrl: string) => {
    try {
      console.log('Notification download initiated for:', imageUrl);
      const response = await fetch(imageUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'image/*'
        }
      });
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `youbnail-thumbnail-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
      console.log('Notification download completed');
      showSuccess('Downloaded!', 'Thumbnail saved to your device');
    } catch (error) {
      console.error('Notification download failed:', error);
      // Fallback: try direct download
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `youbnail-thumbnail-${Date.now()}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('Notification fallback failed:', fallbackError);
        showError('Download Failed', 'Unable to download thumbnail. Please try accessing it from the gallery.');
      }
    }
  }, [showSuccess, showError]);

  const renderCreationPanel = () => {
    switch (mode) {
      case CreationMode.VIDEO:
        return (
          <VideoSnapshot onCapture={async (img) => { 
            // If it's a URL (like YouTube thumbnail), convert to base64
            if (img.startsWith('http')) {
              try {
                const response = await fetch(img);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                  setRefImage(reader.result as string);
                  setMode(CreationMode.REFERENCE);
                };
                reader.readAsDataURL(blob);
              } catch (error) {
                console.error('Failed to convert URL to base64:', error);
                showErrorModal('Image Load Error', 'Failed to load the selected thumbnail. Please try a different one.');
              }
            } else {
              // It's already base64
              setRefImage(img);
              setMode(CreationMode.REFERENCE);
            }
          }} />
        );
      case CreationMode.REFERENCE:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium" style={{color: 'var(--text-secondary)'}}>
                Reference Image
              </label>
              {!refImage ? (
                <label
                  htmlFor="ref-upload"
                  className="upload-area cursor-pointer block"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.opacity = '1';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.opacity = '1';
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      handleReferenceFile(file);
                    }
                  }}
                  style={{ position: 'relative', display: 'block' }}
                >
                  <input 
                    ref={refUploadInputRef}
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,image/jpg" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleReferenceFile(file);
                      }
                      // Reset input to allow selecting the same file again
                      if (e.target) {
                        e.target.value = '';
                      }
                    }} 
                    className="hidden"
                    id="ref-upload"
                  />
                  <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none">
                    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: 'var(--accent-primary)'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-base font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                      Drop your image here, or click to browse
                    </div>
                    <div className="text-sm" style={{color: 'var(--text-muted)'}}>
                      Supports JPEG, PNG, WebP (Max 10MB)
                    </div>
                  </div>
                </label>
              ) : (
                <div className="relative group rounded-xl overflow-hidden border" style={{borderColor: 'var(--border-primary)'}}>
                  <img src={refImage} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                     <button 
                       onClick={() => setRefImage(null)} 
                       className="btn-secondary text-sm"
                     >
                       Remove
                     </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium" style={{color: 'var(--text-secondary)'}}>
                Quick Themes
              </label>
              <div className="grid grid-cols-4 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => applyTheme(theme)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:scale-105 active:scale-95"
                    style={{
                      borderColor: selectedThemeId === theme.id ? 'var(--accent-primary)' : 'var(--border-primary)',
                      background: selectedThemeId === theme.id ? 'var(--accent-primary)' : 'var(--bg-card)',
                      color: selectedThemeId === theme.id ? 'white' : 'var(--text-primary)'
                    }}
                    title={theme.name}
                  >
                    <span className="text-2xl mb-1">{theme.icon}</span>
                    <span className="text-xs font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-secondary)'}}>
                  Overlay Title
                </label>
                <input 
                  ref={overlayTextRef1}
                  type="text"
                  value={options.overlayText}
                  onChange={handleOverlayTextChange}
                  placeholder="e.g. 100 DAYS SURVIVAL"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-secondary)'}}>
                  Instructions <span className="text-xs" style={{color: 'var(--text-muted)'}}>(Optional)</span>
                </label>
              <textarea 
                ref={promptRef1}
                value={prompt}
                onChange={handlePromptChange}
                placeholder="e.g. Add a volcanic background..."
                className="input-field resize-none"
                rows={3}
              />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-secondary)'}}>
                Describe your thumbnail
              </label>
              <textarea 
                ref={promptRef2}
                value={prompt}
                onChange={handlePromptChange}
                placeholder="A glowing gamer headset on a dark desk..."
                className="input-field resize-none"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-secondary)'}}>
                Overlay Text
              </label>
              <input 
                ref={overlayTextRef2}
                type="text" 
                value={options.overlayText}
                onChange={handleOverlayTextChange}
                placeholder="e.g. BEST TECH 2024" 
                className="input-field"
              />
            </div>
          </div>
        );
    }
  };

  type NavItem = {
    id: 'home' | 'create' | 'gallery' | 'plans' | 'profile' | 'usage' | 'billing' | 'support';
    label: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
  };

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'create', label: 'Studio', icon: Squares2X2Icon },
    { id: 'gallery', label: 'Gallery', icon: PhotoIcon },
    { id: 'plans', label: 'Pricing', icon: CurrencyDollarIcon },
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'usage', label: 'Usage', icon: ChartBarSquareIcon },
    { id: 'billing', label: 'Billing', icon: CreditCardIcon },
    { id: 'support', label: 'Support', icon: LifebuoyIcon }
  ];

  // Main app content (protected) - Memoized JSX to prevent remounting
  const appContentJSX = useMemo(() => {
    // Add null check for user
    if (!user) {
      return null;
    }

    const planName = user.plan.charAt(0).toUpperCase() + user.plan.slice(1);
    const rawBilling = user.subscription_billing_period || 'monthly';
    const billingShort =
      typeof rawBilling === 'string' && rawBilling.toLowerCase().startsWith('annual')
        ? 'Yearly'
        : 'Monthly';

    return (
    <div className="min-h-screen flex flex-col bg-black">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 border-b border-gray-700 backdrop-blur-xl">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <div className="cursor-pointer group" onClick={() => navigateToTab('create')}>
            <img 
              src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/1.png" 
              alt="Youbnail" 
              className="h-10 w-auto object-contain transition-all group-hover:scale-105"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-medium text-gray-400">
                  {planName} • {billingShort}
                </div>
                <div className="text-sm font-semibold text-white">
                  {user.credits} credits
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all hover:scale-105 shadow-lg"
                title="Generation Progress"
              >
                <BellIcon className="w-5 h-5 text-gray-300" />
                {activeGenerations.size > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {Array.from(activeGenerations.values()).filter((g: any) => g.status === 'generating').length || activeGenerations.size}
                    </span>
                  </div>
                )}
              </button>
              <button
                onClick={() => navigateToTab('profile')}
                className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-all hover:scale-105 shadow-lg" 
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              <button
                onClick={async () => {
                  try {
                    await authService.signOut();
                    setIsAuthenticated(false);
                    setUser(null);
                  } catch (error) {
                    console.error('Sign out failed');
                  }
                }}
                className="text-sm px-4 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-black transition-colors"
              >
                Sign Out
              </button>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden w-8 h-8 flex items-center justify-center rounded transition-colors text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} 
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* New Sidebar (mobile + desktop) */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        onNavigate={(tab) => navigateToTab(tab)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex pt-16">
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:ml-64 bg-black min-h-screen">
          {activeTab === 'home' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div 
              className="bg-black rounded-xl border border-gray-700 p-8 relative overflow-hidden shadow-sm"
            >
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-red-900 text-gray-300 border border-red-700">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    New • Vertical + Horizontal ready
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
                    Design scroll-stopping thumbnails in minutes.
                  </h1>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Switch between 16:9 and 9:16, blend prompts with reference images, and refine with selective edits - all in one studio.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => navigateToTab('create')} 
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Open Studio
                    </button>
                    <button 
                      onClick={() => navigateToTab('gallery')} 
                      className="px-6 py-3 bg-black border border-gray-600 text-gray-200 font-semibold rounded-lg hover:bg-gray-900 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      View Gallery
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full" style={{background: 'var(--bg-secondary)', color: 'var(--text-secondary)'}}>
                      ⚡ Live AI generation
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full" style={{background: 'var(--bg-secondary)', color: 'var(--text-secondary)'}}>
                      🎯 Precise region edits
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full" style={{background: 'var(--bg-secondary)', color: 'var(--text-secondary)'}}>
                      🎨 Quick theme presets
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-black rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-900 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">Credits Available</p>
                        <p className="text-2xl font-bold text-white">{user.credits}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Ready for generation</p>
                  </div>
                  
                  <div className="bg-black rounded-xl border border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-900 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">Format</p>
                        <p className="text-2xl font-bold text-white">{options.aspectRatio}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Switch anytime in Studio</p>
                  </div>
                  
                  <div className="bg-black rounded-xl border border-gray-700 p-6 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-900 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-300">Recent Mode</p>
                          <p className="text-lg font-semibold text-white">
                            {mode === CreationMode.VIDEO ? 'Video Snapshot' : mode === CreationMode.REFERENCE ? 'Reference' : 'Prompt'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigateToTab('create')} 
                        className="px-4 py-2 text-sm font-medium bg-red-900 text-gray-200 rounded-lg hover:bg-red-800 transition-colors"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Before/After Section */}
            <div className="bg-black rounded-xl border border-gray-700 p-8 shadow-sm">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 text-white">See the Difference</h2>
                <p className="text-gray-300">Transform your thumbnails with AI-powered generation</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before Side */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-center" style={{color: 'var(--text-muted)'}}>Before</div>
                  <div className="relative rounded-xl overflow-hidden border" style={{borderColor: 'var(--border-primary)', aspectRatio: '16/9'}}>
                    <img 
                      src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/before.png" 
                      alt="Before thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTYwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjgwIiB5PSI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM2YjczODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+QmVmb3JlPC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                </div>
                
                {/* After Side - Rotating Images */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-center" style={{color: 'var(--text-muted)'}}>After</div>
                  <div className="relative rounded-xl overflow-hidden border" style={{borderColor: 'var(--border-primary)', aspectRatio: '16/9'}}>
                    <img 
                      src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/after.png"
                      alt="After thumbnail"
                      className="w-full h-full object-cover transition-opacity duration-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Creator Credit */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-400">
                  Example from{" "}
                  <a 
                    href="https://www.youtube.com/@CzarDanya/videos" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 transition-colors underline"
                  >
                    @CzarDanya
                  </a>
                  {" "}YouTube Channel
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black rounded-xl border border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Adaptive Studio</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">Prompt-only, reference, or snapshots - swap modes without losing context.</p>
                  </div>
                </div>
              </div>
              <div className="bg-black rounded-xl border border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PhotoIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Reference Boost</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">Drop an image, apply Quick Themes, and guide the AI with tailored notes.</p>
                  </div>
                </div>
              </div>
              <div className="bg-black rounded-xl border border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ScissorsIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Selective Edits</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">Highlight an area and instruct the AI - perfect for quick retouches.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Recent Activity</h3>
                  <button onClick={() => navigateToTab('gallery')} className="text-sm font-medium text-white hover:text-gray-300">Gallery →</button>
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>{user.credits > 0 ? 'Ready to create' : 'Add credits to start'}</span>
                    <SparklesIcon className="w-4 h-4" style={{color: 'var(--accent-primary)'}} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan</span>
                    <CreditCardIcon className="w-4 h-4" style={{color: 'var(--accent-primary)'}} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{user.credits} Credits</span>
                    <CurrencyDollarIcon className="w-4 h-4" style={{color: 'var(--accent-primary)'}} />
                  </div>
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{color: 'var(--text-secondary)'}}>Quick start</span>
                  <button onClick={() => navigateToTab('create')} className="text-xs font-semibold" style={{color: 'var(--accent-primary)'}}>Studio</button>
                </div>
                <div className="space-y-2">
                  <button onClick={() => { navigateToTab('create'); setMode(CreationMode.PROMPT); }} className="w-full btn-secondary justify-between text-sm">
                    Start with prompt <span>→</span>
                  </button>
                  <button onClick={() => { navigateToTab('create'); setMode(CreationMode.REFERENCE); }} className="w-full btn-secondary justify-between text-sm">
                    Start with reference <span>→</span>
                  </button>
                  <button onClick={() => { navigateToTab('create'); setMode(CreationMode.VIDEO); }} className="w-full btn-secondary justify-between text-sm">
                    Capture from video <span>→</span>
                  </button>
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{color: 'var(--text-secondary)'}}>Support</span>
                  <button onClick={() => navigateToTab('support')} className="text-xs font-semibold" style={{color: 'var(--accent-primary)'}}>Ask</button>
                </div>
                <p className="text-sm mb-3" style={{color: 'var(--text-secondary)'}}>Need help with a look? Tell us what you want to achieve and we’ll guide you.</p>
                <button onClick={() => navigateToTab('support')} className="btn-primary w-full text-sm">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Free User Notice */}
            {user?.plan === 'free' && (
              <div className="max-w-7xl mx-auto">
                <div className="bg-black border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-900 rounded-xl flex items-center justify-center">
                        🎯
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">
                          Choose a Plan to Start Creating
                        </h3>
                        <p className="text-sm text-gray-300">
                          Choose a plan to start generating thumbnails!
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigateToTab('plans')}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                    >
                      Choose Plan →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-black rounded-xl border border-gray-700 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      Create Thumbnail
                    </h2>
                  </div>
                
                <div className="flex gap-1 mb-6">
                  {[CreationMode.PROMPT, CreationMode.REFERENCE, CreationMode.VIDEO].map((m) => (
                    <button 
                      key={m} 
                      onClick={() => { setMode(m); setRefImage(null); setSelectedThemeId(null); }} 
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-100 ${
                        mode === m 
                          ? 'bg-red-900 text-white border border-red-700' 
                          : 'text-gray-300 hover:text-white hover:bg-black'
                      }`}
                    >
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-white">
                    Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleVideoFormatClick}
                      className={`px-4 py-4 rounded-xl border-2 transition-colors duration-150 font-medium text-sm ${
                        options.aspectRatio === '16:9' 
                          ? 'border-[#ef4444] bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/30' 
                          : 'border-[#7f1d1d] bg-[#450a0a] text-[#fca5a5] hover:border-[#991b1b] hover:bg-[#7f1d1d]'
                      }`}
                    >
                      📺 16:9 (Video)
                    </button>
                    <button
                      onClick={handleReelsFormatClick}
                      className={`px-4 py-4 rounded-xl border-2 transition-colors duration-150 font-medium text-sm ${
                        options.aspectRatio === '9:16' 
                          ? 'border-[#ef4444] bg-[#ef4444] text-white shadow-lg shadow-[#ef4444]/30' 
                          : 'border-[#7f1d1d] bg-[#450a0a] text-[#fca5a5] hover:border-[#991b1b] hover:bg-[#7f1d1d]'
                      }`}
                    >
                      📱 9:16 (Reels)
                    </button>
                  </div>
                </div>
                
                {renderCreationPanel()}
                
                <div className="mt-8">
                  <button
                    onClick={() => handleGenerate(false)}
                    disabled={isGenerating || isEditMode || isRateLimited}
                    className="w-full bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-[#7f1d1d] text-white font-semibold py-4 text-base rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Generating... {generationProgress}%</span>
                      </>
                    ) : isRateLimited ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Please Wait...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate Thumbnail</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              </div>

              <div className="lg:col-span-7">
              <div className="card p-6 min-h-[600px] flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="status-dot"></div>
                    <h3 className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>
                      Output Preview
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {!isEditMode && generatedThumb && (
                      <button 
                        onClick={() => setIsEditMode(true)} 
                        disabled={user.plan === 'starter' || user.plan === 'free'}
                        className={`btn-secondary text-sm ${
                          (user.plan === 'starter' || user.plan === 'free') ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Edit
                      </button>
                    )}
                    <button 
                      onClick={() => setShowMockup(!showMockup)} 
                      className={`text-sm px-3 py-2 rounded-lg font-medium transition-colors duration-100 ${
                        showMockup 
                          ? 'text-white' 
                          : ''
                      }`}
                      style={{
                        background: showMockup ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                        color: showMockup ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {showMockup ? "Preview" : "Mockup"}
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                  {!generatedThumb && !isGenerating ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 rounded-xl flex items-center justify-center mx-auto mb-6" style={{background: 'var(--bg-tertiary)'}}>
                        <svg className="w-10 h-10" style={{color: 'var(--text-muted)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                        Ready to generate
                      </h4>
                      <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                        Your thumbnail will appear here
                      </p>
                    </div>
                  ) : isGenerating ? (
                    <div className="relative w-full h-full flex flex-col">
                      {/* Skeleton Preview */}
                      <div className="flex-1 min-h-[450px]">
                        <SkeletonPreview prompt={skeletonPrompt} progress={generationProgress} />
                      </div>
                      
                      {/* Progress bar overlay */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border" style={{borderColor: 'var(--border-primary)'}}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Generating...</span>
                            <span className="text-sm font-semibold" style={{color: 'var(--text-primary)'}}>               {generationProgress}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full overflow-hidden" style={{background: '#1a1a1a'}}>
                            <div 
                              className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                              style={{
                                width: `${generationProgress}%`,
                                background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                                boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                              }}
                            >
                              <div 
                                className="absolute inset-0"
                                style={{
                                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                                  animation: 'shimmer 1.5s infinite'
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-xs mt-2 text-center" style={{color: 'var(--text-secondary)'}}>
                            {generationProgress < 30 ? 'Analyzing your prompt...' :
                             generationProgress < 60 ? 'Creating visual elements...' :
                             generationProgress < 90 ? 'Adding finishing touches...' :
                             generationProgress < 100 ? 'Optimizing quality...' :
                             'Complete!'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isEditMode ? (
                    <div className="w-full h-full flex flex-col gap-6 animate-in zoom-in-95 duration-500">
                      <div 
                        className="flex-1 min-h-[450px] rounded-xl overflow-hidden border shadow-lg mx-auto w-full max-w-full" 
                        style={{
                          borderColor: 'var(--border-primary)', 
                          background: 'var(--bg-card)',
                          aspectRatio: options.aspectRatio === '9:16' ? '9/16' : '16/9',
                          maxHeight: options.aspectRatio === '9:16' ? '80vh' : 'none'
                        }}
                      >
                        <ImageEditor imageUrl={generatedThumb!} onSelectionComplete={(area) => setSelectedArea(area)} />
                      </div>
                      {selectedArea && (
                        <div className="card p-6 flex flex-col gap-4 animate-in slide-in-from-bottom-8">
                          <input 
                            ref={editPromptRef}
                            type="text" 
                            value={editPrompt}
                            onChange={handleEditPromptChange}
                            placeholder="Describe the change for this selected area..." 
                            className="input-field" 
                            autoFocus 
                          />
                          <div className="flex gap-3">
                            <button 
                              onClick={() => { 
                                setIsEditMode(false); 
                                setSelectedArea(null); 
                                setEditPrompt('');
                              }} 
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleGenerate(true)} 
                              disabled={!editPrompt.trim()}
                              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Execute Update
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full space-y-6">
                      {showMockup ? (
                        <div className="w-full border rounded-xl p-6" style={{borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)'}}>
                          <div className="flex flex-col lg:flex-row gap-6">
                            <div className="lg:w-2/3">
                              <div 
                                className={`relative rounded-lg overflow-hidden border`}
                                style={{
                                  borderColor: 'var(--border-primary)',
                                  aspectRatio: options.aspectRatio === '9:16' ? '9/16' : '16/9'
                                }}
                              >
                                <img src={generatedThumb!} className="w-full h-full object-cover" />
                                <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-medium text-white" style={{background: 'rgba(0,0,0,0.8)'}}>
                                  14:52
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 rounded-lg border-2 border-dashed flex items-center justify-center p-8" style={{borderColor: 'var(--border-secondary)'}}>
                              <span className="text-sm font-medium" style={{color: 'var(--text-muted)'}}>
                                {options.aspectRatio === '9:16' ? 'Reels/Shorts Feed Preview' : 'YouTube Feed Preview'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="relative group rounded-xl overflow-hidden border mx-auto w-full max-w-full" 
                          style={{
                            borderColor: 'var(--border-primary)',
                            aspectRatio: options.aspectRatio === '9:16' ? '9/16' : '16/9',
                            maxHeight: options.aspectRatio === '9:16' ? '80vh' : 'none'
                          }}
                        >
                           <img src={generatedThumb!} className="w-full h-full object-contain" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4">
                             <button
                               onClick={async () => {
                                 try {
                                   console.log('Download initiated for:', generatedThumb);
                                   
                                   // Handle both base64 data URIs and URLs
                                   if (generatedThumb!.startsWith('data:image')) {
                                     console.log('Processing base64 image');
                                     // For base64, create blob from data URI
                                     const response = await fetch(generatedThumb!);
                                     if (!response.ok) throw new Error('Failed to fetch base64 image');
                                     const blob = await response.blob();
                                     const blobUrl = URL.createObjectURL(blob);
                                     
                                     const link = document.createElement('a');
                                     link.href = blobUrl;
                                     link.download = `youbnail-thumbnail-${Date.now()}.png`;
                                     document.body.appendChild(link);
                                     link.click();
                                     document.body.removeChild(link);
                                     
                                     URL.revokeObjectURL(blobUrl);
                                     console.log('Base64 download completed');
                                   } else {
                                     console.log('Processing URL image');
                                     // For URLs (including cross-origin), fetch as blob
                                     const response = await fetch(generatedThumb!, {
                                       mode: 'cors',
                                       headers: {
                                         'Accept': 'image/*'
                                       }
                                     });
                                     if (!response.ok) throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
                                     const blob = await response.blob();
                                     const blobUrl = URL.createObjectURL(blob);
                                     
                                     const link = document.createElement('a');
                                     link.href = blobUrl;
                                     link.download = `youbnail-thumbnail-${Date.now()}.png`;
                                     document.body.appendChild(link);
                                     link.click();
                                     document.body.removeChild(link);
                                     
                                     URL.revokeObjectURL(blobUrl);
                                     console.log('URL download completed');
                                   }
                                   showSuccess('Download Started', 'Your thumbnail is being downloaded');
                                 } catch (error) {
                                   console.error('Download operation failed:', error);
                                   // Fallback: try direct download
                                   try {
                                     const link = document.createElement('a');
                                     link.href = generatedThumb!;
                                     link.download = `youbnail-thumbnail-${Date.now()}.png`;
                                     link.target = '_blank';
                                     document.body.appendChild(link);
                                     link.click();
                                     document.body.removeChild(link);
                                     console.log('Fallback download attempted');
                                   } catch (fallbackError) {
                                     console.error('Fallback download failed:', fallbackError);
                                     showError('Download Failed', 'Unable to download the thumbnail. Please try right-clicking and selecting "Save image as..."');
                                   }
                                 }
                               }}
                               className="btn-primary px-6"
                             >
                               Download HD
                             </button>
                             <button 
                               onClick={() => handleShare(generatedThumb!)} 
                               className="btn-secondary px-6"
                             >
                               Share
                             </button>
                           </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 justify-center">
                        <button 
                          onClick={() => handleGenerate(false)} 
                          className="btn-secondary px-4 py-2 text-sm"
                        >
                          Generate Again
                        </button>
                        <button 
                          onClick={() => { setRefImage(generatedThumb); setMode(CreationMode.REFERENCE); }} 
                          className="btn-secondary px-4 py-2 text-sm"
                        >
                          Use as Reference
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                   <h1 className="text-3xl font-bold mb-2 text-white">
                     Your Gallery
                   </h1>
                   <p className="text-gray-300">
                     {history.length} thumbnail{history.length !== 1 ? 's' : ''} generated
                   </p>
                </div>
                <button 
                  onClick={() => navigateToTab('create')} 
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create New
                </button>
             </div>
             {isLoadingGallery ? (
               <GallerySkeleton />
             ) : history.length === 0 ? (
               <div className="text-center py-16">
                 <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4" style={{background: 'var(--bg-tertiary)'}}>
                   <svg className="w-8 h-8" style={{color: 'var(--text-muted)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                 </div>
                 <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                   No thumbnails yet
                 </h3>
                 <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                   Create your first thumbnail to see it here
                 </p>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map(item => (
                  <div key={item.id} className="bg-black rounded-xl border border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-video group">
                      <img src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                         <button 
                           onClick={() => handleShare(item.url)} 
                           className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                           title="Share thumbnail"
                         >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                           </svg>
                         </button>
                         <button
                           onClick={async () => {
                             try {
                               console.log('Gallery download initiated for:', item.url);
                               // Fetch the image to download it properly (works with cross-origin URLs)
                               const response = await fetch(item.url, {
                                 mode: 'cors',
                                 headers: {
                                   'Accept': 'image/*'
                                 }
                               });
                               if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
                               const blob = await response.blob();
                               const blobUrl = URL.createObjectURL(blob);
                               
                               // Create download link
                               const link = document.createElement('a');
                               link.href = blobUrl;
                               link.download = `youbnail-thumbnail-${item.id || Date.now()}.png`;
                               document.body.appendChild(link);
                               link.click();
                               document.body.removeChild(link);
                               
                               // Clean up blob URL
                               URL.revokeObjectURL(blobUrl);
                               console.log('Gallery download completed');
                               showSuccess('Download Started', 'Your thumbnail is being downloaded');
                             } catch (error) {
                               console.error('Gallery download failed:', error);
                               // Fallback: try direct download
                               try {
                                 const link = document.createElement('a');
                                 link.href = item.url;
                                 link.download = `youbnail-thumbnail-${item.id || Date.now()}.png`;
                                 link.target = '_blank';
                                 document.body.appendChild(link);
                                 link.click();
                                 document.body.removeChild(link);
                                 console.log('Fallback download attempted');
                               } catch (fallbackError) {
                                 console.error('Fallback failed:', fallbackError);
                                 // Last resort: open in new tab
                                 window.open(item.url, '_blank');
                                 showWarning('Download Issue', 'The image opened in a new tab. Right-click and select "Save image as..." to download');
                               }
                             }
                           }}
                           className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
                           title="Download thumbnail"
                         >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                           </svg>
                         </button>
                         <button
                           onClick={() => {
                             showConfirm(
                               'Delete Thumbnail',
                               'Are you sure you want to delete this thumbnail? This action cannot be undone.',
                               () => handleDeleteThumbnail(item.id, item.storage_path),
                               'danger',
                               'Delete',
                               'Cancel'
                             );
                           }}
                           className="p-3 bg-red-500/20 backdrop-blur-sm rounded-xl text-white hover:bg-red-500/40 transition-colors"
                           title="Delete thumbnail"
                         >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </button>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-700">
                      <p className="text-sm mb-3 text-gray-300 line-clamp-2">
                        "{item.prompt}"
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <button 
                          onClick={() => { setGeneratedThumb(item.url); setPrompt(item.prompt); navigateToTab('create'); }} 
                          className="px-3 py-1.5 text-xs font-medium bg-red-900 text-gray-200 rounded-lg hover:bg-red-800 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="max-w-7xl mx-auto px-6 py-[1px] space-y-12">
            {/* Free User Notice */}
            {user?.plan === 'free' && (
              <div className="max-w-4xl mx-auto">
                <div className="card p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{background: 'var(--accent-primary)'}}></div>
                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background: 'var(--accent-light)'}}>
                        🎯
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1" style={{color: 'var(--text-primary)'}}>
                          Choose Your Plan to Get Started
                        </h3>
                        <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                          Select a plan below to start creating amazing thumbnails with AI
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* New Pricing Component */}
            <Pricing_04 
              user={user}
              isUpdatingPlan={isUpdatingPlan}
              setIsUpdatingPlan={setIsUpdatingPlan}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Header Section */}
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Profile Settings</h1>
              <p className="text-base" style={{color: 'var(--text-secondary)'}}>Manage your account information and preferences</p>
            </div>

            {/* Profile Overview Card */}
            <div className="card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{background: 'var(--accent-primary)'}}></div>
              <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 flex items-center justify-center shadow-lg" style={{borderColor: 'var(--accent-primary)', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))'}}>
                    <BoltIcon className="w-10 h-10 sm:w-16 sm:h-16 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg" style={{background: 'var(--accent-primary)'}}>
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
                    {user.name}
                  </h2>
                  <p className="text-base mb-6 flex items-center gap-2" style={{color: 'var(--text-secondary)'}}>
                    <EnvelopeIcon className="w-4 h-4" />
                    {user.email}
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{background: 'var(--bg-secondary)'}}>
                      <CurrencyDollarIcon className="w-5 h-5" style={{color: 'var(--accent-primary)'}} />
                      <div>
                        <div className="text-xs font-medium" style={{color: 'var(--text-muted)'}}>Credits</div>
                        <div className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>{user.credits}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigateToTab('plans')} 
                      className="btn-primary px-6 py-2 text-sm font-semibold"
                    >
                      Add Credits
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Settings */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'var(--accent-light)'}}>
                    <UserCircleIcon className="w-5 h-5" style={{color: 'var(--accent-primary)'}} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>Account Settings</h3>
                    <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Update your personal information</p>
                  </div>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                      Display Name
                    </label>
                    <input 
                      ref={editNameRef}
                      type="text" 
                      value={editName}
                      onChange={handleEditNameChange}
                      className="input-field"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                      Email Address
                    </label>
                    <input 
                      ref={editEmailRef}
                      type="email" 
                      value={editEmail}
                      onChange={handleEditEmailChange}
                      className="input-field"
                      placeholder="Enter your email"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn-primary w-full py-3 text-sm font-semibold"
                  >
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Connected Accounts */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'var(--accent-light)'}}>
                    <svg className="w-5 h-5" style={{color: 'var(--accent-primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>Connected Accounts</h3>
                    <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Manage your social account connections</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg border transition-all hover:border-opacity-50" style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)'}}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm" style={{background: 'white'}}>
                        <svg className="w-7 h-7" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{color: 'var(--text-primary)'}}>Google</p>
                        <p className="text-xs flex items-center gap-1 mt-0.5" style={{color: 'var(--text-secondary)'}}>
                          {isGoogleLinked ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full" style={{background: 'var(--accent-success)'}}></span>
                              Connected
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full" style={{background: 'var(--text-muted)'}}></span>
                              Not connected
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {isGoogleLinked ? (
                      <button
                        onClick={async () => {
                          try {
                            await authService.unlinkGoogle();
                            setIsGoogleLinked(false);
                            showSuccess('Account Unlinked', 'Google account has been unlinked successfully.');
                          } catch (error: any) {
                            showError('Unlink Failed', error.message || 'Failed to unlink Google account.');
                          }
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-primary)'
                        }}
                      >
                        Unlink
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            await authService.signInWithGoogle();
                            // After redirect back, the state will be updated automatically
                          } catch (error: any) {
                            showError('Link Failed', error.message || 'Failed to link Google account.');
                          }
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                        style={{
                          background: 'var(--accent-primary)',
                          color: 'white'
                        }}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold" style={{color: 'var(--text-primary)'}}>Usage History</h2>
              <div className="flex items-center gap-4">
                <div className="text-center sm:text-right">
                  <div className="text-xs font-medium" style={{color: 'var(--text-muted)'}}>Total Used</div>
                  <div className="text-lg sm:text-xl font-bold" style={{color: 'var(--accent-primary)'}}>
                    {usageHistory.reduce((sum, record) => sum + record.credits, 0)} credits
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-xs font-medium" style={{color: 'var(--text-muted)'}}>Remaining</div>
                  <div className="text-lg sm:text-xl font-bold" style={{color: 'var(--text-primary)'}}>
                    {user.credits} credits
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-4 sm:p-6">
              {isLoadingUsage ? (
                <UsageTableSkeleton />
              ) : usageHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{background: 'var(--bg-tertiary)'}}>
                    <svg className="w-8 h-8" style={{color: 'var(--text-muted)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--text-primary)'}}>No usage recorded yet</h3>
                  <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                    Start generating thumbnails to see your usage history here
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{borderBottom: '1px solid var(--border-primary)'}}>
                          <th className="text-left py-3 px-2 font-semibold" style={{color: 'var(--text-secondary)'}}>Date & Time</th>
                          <th className="text-left py-3 px-2 font-semibold" style={{color: 'var(--text-secondary)'}}>Type</th>
                          <th className="text-left py-3 px-2 font-semibold" style={{color: 'var(--text-secondary)'}}>Mode</th>
                          <th className="text-left py-3 px-2 font-semibold" style={{color: 'var(--text-secondary)'}}>Format</th>
                          <th className="text-left py-3 px-2 font-semibold" style={{color: 'var(--text-secondary)'}}>Credits</th>
                          <th className="text-left py-3 px-2 font-semibold" style={{color: 'var(--text-secondary)'}}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageHistory.map((record) => {
                          const date = new Date(record.timestamp);
                          const formattedDate = date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          });
                          const formattedTime = date.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          });
                          
                          return (
                            <tr 
                              key={record.id} 
                              style={{borderBottom: '1px solid var(--border-primary)'}}
                              className="hover:bg-opacity-50"
                            >
                              <td className="py-3 px-2" style={{color: 'var(--text-primary)'}}>
                                <div className="font-medium">{formattedDate}</div>
                                <div className="text-xs" style={{color: 'var(--text-muted)'}}>{formattedTime}</div>
                              </td>
                              <td className="py-3 px-2">
                                <span 
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    background: record.type === 'edit' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                    color: record.type === 'edit' ? 'var(--accent-primary)' : 'var(--accent-success)'
                                  }}
                                >
                                  {record.type === 'edit' ? 'Edit' : 'Generate'}
                                </span>
                              </td>
                              <td className="py-3 px-2" style={{color: 'var(--text-primary)'}}>
                                {record.mode === CreationMode.PROMPT ? 'Prompt' : 
                                 record.mode === CreationMode.REFERENCE ? 'Reference' : 'Video'}
                              </td>
                              <td className="py-3 px-2" style={{color: 'var(--text-primary)'}}>
                                {record.aspectRatio}
                              </td>
                              <td className="py-3 px-2">
                                <span className="font-semibold" style={{color: 'var(--accent-primary)'}}>
                                  -{record.credits}
                                </span>
                              </td>
                              <td className="py-3 px-2" style={{color: 'var(--text-secondary)'}}>
                                <div className="max-w-xs truncate text-xs">
                                  {record.prompt || 'N/A'}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {usageHistory.map((record) => {
                      const date = new Date(record.timestamp);
                      const formattedDate = date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      });
                      const formattedTime = date.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                      
                      return (
                        <div 
                          key={record.id} 
                          className="p-4 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            borderColor: 'var(--border-primary)'
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="font-medium text-sm" style={{color: 'var(--text-primary)'}}>
                                {formattedDate}
                              </div>
                              <div className="text-xs" style={{color: 'var(--text-muted)'}}>
                                {formattedTime}
                              </div>
                            </div>
                            <span className="font-semibold text-sm" style={{color: 'var(--accent-primary)'}}>
                              -{record.credits} credits
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <div className="text-xs font-medium mb-1" style={{color: 'var(--text-muted)'}}>Type</div>
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium inline-block"
                                style={{
                                  background: record.type === 'edit' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                  color: record.type === 'edit' ? 'var(--accent-primary)' : 'var(--accent-success)'
                                }}
                              >
                                {record.type === 'edit' ? 'Edit' : 'Generate'}
                              </span>
                            </div>
                            <div>
                              <div className="text-xs font-medium mb-1" style={{color: 'var(--text-muted)'}}>Format</div>
                              <div className="text-sm" style={{color: 'var(--text-primary)'}}>
                                {record.aspectRatio}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-xs font-medium mb-1" style={{color: 'var(--text-muted)'}}>Mode</div>
                            <div className="text-sm" style={{color: 'var(--text-primary)'}}>
                              {record.mode === CreationMode.PROMPT ? 'Prompt' : 
                               record.mode === CreationMode.REFERENCE ? 'Reference' : 'Video'}
                            </div>
                          </div>
                          
                          {record.prompt && (
                            <div>
                              <div className="text-xs font-medium mb-1" style={{color: 'var(--text-muted)'}}>Details</div>
                              <div className="text-sm break-words" style={{color: 'var(--text-secondary)'}}>
                                {record.prompt}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Manage Subscription</h2>
              <p className="text-sm sm:text-base" style={{color: 'var(--text-secondary)'}}>View and manage your subscription details</p>
            </div>
            
            {/* Subscription Status Card */}
            <div className="card p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold" style={{background: 'var(--accent-light)', color: 'var(--accent-primary)'}}>
                    Current Plan: {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                  </span>
                  {user.subscription_status === 'active' && user.subscription_ends_at && (
                    <div className="text-xs sm:text-sm flex items-center gap-1.5" style={{color: 'var(--text-muted)'}}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Renews on {new Date(user.subscription_ends_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => navigateToTab('plans')} 
                  className="btn-secondary w-full sm:w-auto whitespace-nowrap text-sm"
                >
                  <span className="hidden sm:inline">Change Your Plan </span>
                  <span className="sm:hidden">Change Plan </span>
                  →
                </button>
              </div>

              {(user.plan === 'starter' || user.plan === 'pro') && (
                <div className="border-t pt-4 mt-4" style={{borderColor: 'var(--border-primary)'}}>
                  <div className="flex items-start gap-2 mb-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: 'var(--text-secondary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Cancel Subscription</h3>
                      <p className="text-xs sm:text-sm leading-relaxed mb-4" style={{color: 'var(--text-secondary)'}}>
                        {user.subscription_status === 'cancelled' 
                          ? 'Your subscription has been cancelled. You will keep access until the end of the current billing period, then move to the Free plan.'
                          : 'Your access will continue until the end of the current billing period. After that, you\'ll move to the Free plan.'}
                      </p>
                      {user.subscription_status !== 'cancelled' && (
                        <button
                          className="btn-secondary w-full sm:w-auto text-sm px-4 py-2.5"
                          disabled={isCancellingSubscription || !user.subscription_id}
                          onClick={async () => {
                            if (isCancellingSubscription) return;
                            
                            if (!user.subscription_id) {
                              alert('No subscription ID found. Please contact support to cancel your subscription.');
                              return;
                            }
                            
                            const confirmed = confirm(
                              'Are you sure you want to cancel your subscription?\n\n' +
                              'You will keep access until the end of the current billing period, ' +
                              'then your account will move to the Free plan.'
                            );
                            if (!confirmed) return;
                            
                            try {
                              setIsCancellingSubscription(true);
                              // Calling cancel-subscription function
                              
                              const { data, error } = await supabase.functions.invoke('cancel-subscription', {
                                body: { userId: user.id },
                              });
                              
                              // Process cancel subscription response
                              
                              if (error) {
                                console.error('Subscription cancellation failed');
                                throw new Error(error.message || 'Failed to cancel subscription');
                              }
                              
                              if (data?.error) {
                                throw new Error(data.error || 'Failed to cancel subscription');
                              }
                              
                              alert('Your cancellation request has been submitted. Your subscription will not renew.');
                              
                              // Refresh user data to show updated status
                              setTimeout(async () => {
                                const updatedUser = await userService.getUserProfile(user.id);
                                if (updatedUser) {
                                  setUser(updatedUser);
                                }
                              }, 1000);
                            } catch (err: any) {
                              console.error('Subscription cancellation failed');
                              const errorMessage = err.message || err.error || 'Failed to cancel subscription. Please try again or contact support.';
                              alert(`Error: ${errorMessage}`);
                            } finally {
                              setIsCancellingSubscription(false);
                            }
                          }}
                        >
                          {isCancellingSubscription ? 'Cancelling…' : 'Cancel Subscription'}
                        </button>
                      )}
                    </div>
                  </div>
                  {!user.subscription_id && user.subscription_status !== 'cancelled' && (
                    <div className="mt-4 p-3 rounded-lg" style={{background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)'}}>
                      <p className="text-xs sm:text-sm mb-1.5 flex items-start gap-2" style={{color: 'var(--text-muted)'}}>
                        <span>⚠️</span>
                        <span>No subscription ID found. The cancel button is disabled.</span>
                      </p>
                      <p className="text-xs sm:text-sm flex items-start gap-2" style={{color: 'var(--text-muted)'}}>
                        <span>💬</span>
                        <span>Need help cancelling? Please contact support.</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Billing Management Card */}
            <div className="card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="text-lg sm:text-xl font-bold mb-1" style={{color: 'var(--text-primary)'}}>Billing</div>
                  <div className="text-sm" style={{color: 'var(--text-muted)'}}>
                    Manage your subscription and billing information.
                  </div>
                </div>
                <button 
                  onClick={() => navigateToTab('plans')}
                  className="btn-primary w-full sm:w-auto whitespace-nowrap"
                >
                  Manage Subscription →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="max-w-5xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center" style={{color: 'var(--text-primary)'}}>Contact Us</h2>
            <p className="text-center" style={{color: 'var(--text-secondary)'}}>For refunds, queries or requests, reach us via any option below.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="mb-2 flex items-center gap-2" style={{color: 'var(--text-primary)'}}>
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>Email us</span>
                </div>
                <p className="text-sm mb-4" style={{color: 'var(--text-secondary)'}}>We're here to help.</p>
                <a href="mailto:support@youbnail.com" className="btn-secondary inline-block">Email</a>
              </div>
              <div className="card p-6">
                <div className="mb-2 flex items-center gap-2" style={{color: 'var(--text-primary)'}}>
                  <AtSymbolIcon className="w-4 h-4" />
                  <span>X</span>
                </div>
                <p className="text-sm mb-4" style={{color: 'var(--text-secondary)'}}>Connect with us on X.</p>
                <a href="https://x.com/youbnail" target="_blank" rel="noopener noreferrer" className="btn-secondary inline-block">Open X</a>
              </div>
              <div className="card p-6">
                <div className="mb-2 flex items-center gap-2" style={{color: 'var(--text-primary)'}}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </div>
                <p className="text-sm mb-4" style={{color: 'var(--text-secondary)'}}>Check us out on Instagram.</p>
                <a href="https://www.instagram.com/youbnail/" target="_blank" rel="noopener noreferrer" className="btn-secondary inline-block">Open Instagram</a>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Close flex wrapper */}
      </div>
      
      {/* Footer temporarily removed for syntax debugging */}
    </div>
    );
  }, [
    user, activeTab, mode, isMobileMenuOpen, prompt, options, selectedThemeId,
    currentAfterImageIndex, refImage, isGenerating, generationProgress, generatedThumb, history,
    usageHistory, showMockup, isEditMode, selectedArea, editPrompt, editName,
    editEmail, billingPeriod, isUpdatingPlan,
    navigateToTab, handleGenerate, addCredits, handleShare, updateOption,
    applyTheme, handleUpdateProfile, handleReferenceFile,
    triggerRefUpload, renderCreationPanel, navItems, location.pathname, navigate,
    handleOverlayTextChange, handlePromptChange, handleEditPromptChange,
    handleEditNameChange, handleEditEmailChange
  ]);

  // Main App component with routing
  // Show loading while checking auth (only on initial load)
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--bg-primary)'}}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 animate-spin mx-auto mb-4" style={{borderColor: 'var(--border-secondary)', borderTopColor: 'var(--accent-primary)'}}></div>
          <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Loading...</p>
        </div>
      </div>
    );
  }

  // Render AppContent directly for authenticated users
  // This prevents React Router from remounting the component on every render
  if (isAuthenticated && user) {
    if (
      location.pathname === '/login' ||
      location.pathname === '/signup'
    ) {
      return <Navigate to="/" replace />;
    }
    return (
      <>
        {appContentJSX}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={closeAlert}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          confirmText={alertModal.confirmText}
        />
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirm}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
        />
        
        {/* Custom Share Modal */}
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isShareModalOpen ? '' : 'hidden'}`} style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <div 
            className="w-full mx-4 max-w-sm rounded-lg shadow-lg p-6"
            style={{backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)'}}
          >
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">Share Thumbnail</h3>
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Choose how you want to share your thumbnail</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    await handleCopyLink(shareModalUrl);
                    setIsShareModalOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-white border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderColor: 'var(--border-primary)',
                    ':hover': { backgroundColor: 'var(--bg-secondary)' }
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Link</span>
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(shareModalUrl);
                      const blob = await response.blob();
                      const file = new File([blob], 'thumbnail.png', { type: 'image/png' });
                      
                      if (navigator.share && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          title: 'Check out my YouTube Thumbnail!',
                          text: 'Generated with Youbnail - AI YouTube Thumbnail Maker',
                          files: [file]
                        });
                      } else {
                        // Fallback to downloading
                        const blobUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `youbnail-thumbnail-${Date.now()}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(blobUrl);
                        showSuccess('Thumbnail downloaded!');
                      }
                      setIsShareModalOpen(false);
                    } catch (error) {
                      showError('Failed to share thumbnail');
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-white border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderColor: 'var(--border-primary)',
                    ':hover': { backgroundColor: 'var(--bg-secondary)' }
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-tertiary)'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share File</span>
                </button>
              </div>
              
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-full p-3 rounded-lg transition-colors border"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-primary)',
                  ':hover': { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-secondary)';
                  e.target.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-tertiary)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        
        {/* Notifications Panel */}
        <NotificationsPanel
          generations={activeGenerations}
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          onRemoveGeneration={handleRemoveGeneration}
          onDownloadResult={handleDownloadFromNotification}
        />
      </>
    );
  }

  // Handle auth routes
  if (location.pathname === '/login') {
    return <Login />;
  }
  if (location.pathname === '/signup') {
    return <Signup />;
  }

  // Handle policy routes
  if (location.pathname === '/privacy') {
    return <PrivacyPolicy />;
  }
  if (location.pathname === '/terms') {
    return <TermsOfService />;
  }
  if (location.pathname === '/refund') {
    return <RefundPolicy />;
  }

  // Default: show landing page
  return <Landing />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppWithToast />
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
