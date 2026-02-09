import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CentopeiaDatabase } from '../storage/Database';
import type { UserProfile, StudySession, TerminalMessage, KnowledgeState } from '../types';
import type { ModuleProgress } from '../storage/Database';

const db = CentopeiaDatabase.getInstance();

// Query keys for proper cache invalidation
export const databaseKeys = {
  all: ['database'] as const,
  profile: () => [...databaseKeys.all, 'profile'] as const,
  session: (id: string) => [...databaseKeys.all, 'session', id] as const,
  allSessions: () => [...databaseKeys.all, 'sessions', 'all'] as const,
  conversations: (sessionId: string) => [...databaseKeys.all, 'conversations', sessionId] as const,
  knowledge: (skillId: string) => [...databaseKeys.all, 'knowledge', skillId] as const,
  allKnowledge: () => [...databaseKeys.all, 'knowledge', 'all'] as const,
  moduleProgress: (id: string) => [...databaseKeys.all, 'module', id] as const,
  allModuleProgress: () => [...databaseKeys.all, 'modules', 'all'] as const,
  pathProgress: (pathId: string) => [...databaseKeys.all, 'path', pathId] as const,
  completedModules: () => [...databaseKeys.all, 'completedCount'] as const,
  totalStudyTime: () => [...databaseKeys.all, 'totalTime'] as const,
};

// QUERY HOOKS
export function useUserProfile() {
  return useQuery({
    queryKey: databaseKeys.profile(),
    queryFn: () => db.getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useStudySession(sessionId: string) {
  return useQuery({
    queryKey: databaseKeys.session(sessionId),
    queryFn: () => db.getStudySession(sessionId),
    enabled: !!sessionId,
  });
}

export function useAllSessions() {
  return useQuery({
    queryKey: databaseKeys.allSessions(),
    queryFn: () => db.getAllSessions(),
  });
}

export function useConversations(sessionId: string) {
  return useQuery({
    queryKey: databaseKeys.conversations(sessionId),
    queryFn: () => db.getConversations(sessionId),
    enabled: !!sessionId,
  });
}

export function useKnowledgeState(skillId: string) {
  return useQuery({
    queryKey: databaseKeys.knowledge(skillId),
    queryFn: () => db.getKnowledgeState(skillId),
    enabled: !!skillId,
  });
}

export function useAllKnowledgeStates() {
  return useQuery({
    queryKey: databaseKeys.allKnowledge(),
    queryFn: () => db.getAllKnowledgeStates(),
  });
}

export function useModuleProgress(moduleId: string) {
  return useQuery({
    queryKey: databaseKeys.moduleProgress(moduleId),
    queryFn: () => db.getModuleProgress(moduleId),
    enabled: !!moduleId,
  });
}

export function useAllModuleProgress() {
  return useQuery({
    queryKey: databaseKeys.allModuleProgress(),
    queryFn: () => db.getAllModuleProgress(),
  });
}

export function usePathProgress(pathId: string) {
  return useQuery({
    queryKey: databaseKeys.pathProgress(pathId),
    queryFn: () => db.getPathProgress(pathId),
    enabled: !!pathId,
  });
}

export function useCompletedModulesCount() {
  return useQuery({
    queryKey: databaseKeys.completedModules(),
    queryFn: () => db.getCompletedModulesCount(),
  });
}

export function useTotalStudyTime() {
  return useQuery({
    queryKey: databaseKeys.totalStudyTime(),
    queryFn: () => db.getTotalStudyTime(),
  });
}

// MUTATION HOOKS
export function useSetUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profile: UserProfile) => db.setUserProfile(profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.profile() });
    },
  });
}

export function useSaveStudySession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (session: StudySession) => db.saveStudySession(session),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.session(variables.id) });
      queryClient.invalidateQueries({ queryKey: databaseKeys.allSessions() });
    },
  });
}

export function useAddConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: TerminalMessage }) => 
      db.addConversation(sessionId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.conversations(variables.sessionId) });
    },
  });
}

export function useClearConversations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => db.clearConversations(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.conversations(sessionId) });
    },
  });
}

export function useSetKnowledgeState() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (state: KnowledgeState) => db.setKnowledgeState(state),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.knowledge(variables.skillId) });
      queryClient.invalidateQueries({ queryKey: databaseKeys.allKnowledge() });
    },
  });
}

export function useSaveModuleProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (progress: ModuleProgress) => db.saveModuleProgress(progress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.moduleProgress(variables.moduleId) });
      queryClient.invalidateQueries({ queryKey: databaseKeys.allModuleProgress() });
      queryClient.invalidateQueries({ queryKey: databaseKeys.completedModules() });
      queryClient.invalidateQueries({ queryKey: databaseKeys.totalStudyTime() });
      // Also invalidate path progress if module has a pathId
      if (variables.pathId) {
        queryClient.invalidateQueries({ queryKey: databaseKeys.pathProgress(variables.pathId) });
      }
    },
  });
}
