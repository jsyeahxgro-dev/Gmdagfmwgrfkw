import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, Edit, Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { insertPlayerSchema, tierOptions, gameModes, tierLevels, type Player, type InsertPlayer, type GameMode, calculatePlayerPoints, getTitleFromPoints } from "@shared/schema";
import { PlayerCard } from "./player-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { z } from "zod";

interface AdminPanelProps {
  onClose: () => void;
  onAdminLogin?: () => void;
  editingPlayer?: Player | null;
  isAuthenticated?: boolean;
}

interface AddPlayerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditPlayerDialogProps {
  open: boolean;
  onClose: () => void;
  player: Player | null;
  gameMode?: GameMode;
  onSuccess: () => void;
}

interface OverallEditDialogProps {
  open: boolean;
  onClose: () => void;
  player: Player | null;
  onSuccess: () => void;
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playerName: string;
  gameMode?: string;
}

const addPlayerSchema = z.object({
  name: z.string().min(1, "Player name is required"),
  gameMode: z.string().min(1, "Game mode is required"),
  tier: z.string().min(1, "Tier is required"),
});

const editPlayerSchema = z.object({
  name: z.string().min(1, "Player name is required"),
  tier: z.string().min(1, "Tier is required"),
});

const overallEditSchema = z.object({
  name: z.string().min(1, "Player name is required"),
  skywarsTier: z.string(),
  midfightTier: z.string(),
  uhcTier: z.string(),
  nodebuffTier: z.string(),
  bedfightTier: z.string(),
});

type AddPlayerData = z.infer<typeof addPlayerSchema>;
type EditPlayerData = z.infer<typeof editPlayerSchema>;
type OverallEditData = z.infer<typeof overallEditSchema>;

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

function AddPlayerDialog({ open, onClose, onSuccess }: AddPlayerDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddPlayerData>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: {
      name: "",
      gameMode: "skywars",
      tier: "LT5",
    },
  });

  const createPlayerMutation = useMutation({
    mutationFn: async (data: AddPlayerData) => {
      const playerData: InsertPlayer = {
        name: data.name,
        skywarsTier: "NR",
        midfightTier: "NR",
        uhcTier: "NR",
        nodebuffTier: "NR",
        bedfightTier: "NR",
      };
      
      // Set the selected gamemode tier
      const gameModeField = `${data.gameMode}Tier` as keyof typeof playerData;
      if (gameModeField in playerData) {
        (playerData as any)[gameModeField] = data.tier;
      }
      
      // Calculate points and auto-assign title
      const tempPlayer = { 
        id: '', 
        name: playerData.name,
        skywarsTier: playerData.skywarsTier || "NR",
        midfightTier: playerData.midfightTier || "NR",
        uhcTier: playerData.uhcTier || "NR",
        nodebuffTier: playerData.nodebuffTier || "NR",
        bedfightTier: playerData.bedfightTier || "NR"
      };
      const totalPoints = calculatePlayerPoints(tempPlayer);
      
      const response = await apiRequest("POST", "/api/players", playerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      form.reset();
      onSuccess();
      toast({
        title: "Player updated",
        description: "Player tier has been successfully updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: AddPlayerData) => {
    createPlayerMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md" data-testid="add-player-dialog">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="add-player-name-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gameMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="add-player-gamemode-select">
                        <SelectValue placeholder="Select game mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gameModes.filter(mode => mode.key !== 'overall').map((gameMode) => (
                        <SelectItem key={gameMode.key} value={gameMode.key}>
                          {gameMode.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="add-player-tier-select">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tierOptions.filter(tier => tier !== "NR").map((tier) => (
                        <SelectItem key={tier} value={tier}>
                          {tier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={createPlayerMutation.isPending}
                data-testid="add-player-submit"
              >
                {createPlayerMutation.isPending ? "Adding..." : "Add Player"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                data-testid="add-player-cancel"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function OverallEditDialog({ open, onClose, player, onSuccess }: OverallEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OverallEditData>({
    resolver: zodResolver(overallEditSchema),
    defaultValues: {
      name: "",
      skywarsTier: "NR",
      midfightTier: "NR",
      uhcTier: "NR",
      nodebuffTier: "NR",
      bedfightTier: "NR",
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async (data: OverallEditData) => {
      if (!player) return;
      
      // Calculate total points and determine title automatically
      const playerWithTiers = {
        ...player,
        skywarsTier: data.skywarsTier,
        midfightTier: data.midfightTier,
        uhcTier: data.uhcTier,
        nodebuffTier: data.nodebuffTier,
        bedfightTier: data.bedfightTier,
      };
      const totalPoints = calculatePlayerPoints(playerWithTiers);
      const autoTitle = getTitleFromPoints(totalPoints);
      
      const updateData: Partial<InsertPlayer> = {
        name: data.name,
        skywarsTier: data.skywarsTier,
        midfightTier: data.midfightTier,
        uhcTier: data.uhcTier,
        nodebuffTier: data.nodebuffTier,
        bedfightTier: data.bedfightTier,
      };
      
      const response = await apiRequest("PATCH", `/api/players/${player.id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      onSuccess();
      toast({
        title: "Player updated",
        description: "Player has been successfully updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update player",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: OverallEditData) => {
    updatePlayerMutation.mutate(data);
  };

  useEffect(() => {
    if (player && open) {
      form.reset({
        name: player.name,
        skywarsTier: player.skywarsTier,
        midfightTier: player.midfightTier,
        uhcTier: player.uhcTier,
        nodebuffTier: player.nodebuffTier,
        bedfightTier: player.bedfightTier,
      });
    }
  }, [player, open, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="overall-edit-dialog">
        <DialogHeader>
          <DialogTitle>Edit Player - Overall</DialogTitle>
        </DialogHeader>
        {player && (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-12 h-12 border-2 border-border/30">
                <AvatarImage 
                  src={`https://mc-heads.net/avatar/${player.name}/64`}
                  alt={`${player.name}'s skin`}
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{player.name}</h3>
                <p className="text-sm text-muted-foreground">Edit all game modes</p>
              </div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="overall-edit-name-input" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: "skywarsTier", label: "Skywars" },
                    { key: "midfightTier", label: "Midfight" },
                    { key: "uhcTier", label: "UHC" },
                    { key: "nodebuffTier", label: "Nodebuff" },
                    { key: "bedfightTier", label: "Bedfight" }
                  ].map((gameMode) => (
                    <FormField
                      key={gameMode.key}
                      control={form.control}
                      name={gameMode.key as keyof OverallEditData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{gameMode.label}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid={`overall-edit-${gameMode.key}-select`}>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tierOptions.map((tier) => (
                                <SelectItem key={tier} value={tier}>
                                  {tier === "NR" ? "Not Ranked" : tier}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={updatePlayerMutation.isPending}
                    data-testid="overall-edit-submit"
                  >
                    {updatePlayerMutation.isPending ? "Updating..." : "Update Player"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    data-testid="overall-edit-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditPlayerDialog({ open, onClose, player, gameMode, onSuccess }: EditPlayerDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditPlayerData>({
    resolver: zodResolver(editPlayerSchema),
    defaultValues: {
      name: "",
      tier: "LT5",
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async (data: EditPlayerData) => {
      if (!player || !gameMode) return;
      
      // Create updated player object for points calculation
      const updatedPlayer = { ...player, name: data.name };
      const gameModeField = `${gameMode}Tier` as keyof Player;
      (updatedPlayer as any)[gameModeField] = data.tier;
      
      // Auto-calculate title based on new points
      const totalPoints = calculatePlayerPoints(updatedPlayer);
      const autoTitle = getTitleFromPoints(totalPoints);
      
      const updateData: Partial<InsertPlayer> = {
        name: data.name,
      };
      (updateData as any)[gameModeField] = data.tier;
      
      const response = await apiRequest("PATCH", `/api/players/${player.id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      onSuccess();
      toast({
        title: "Player updated",
        description: "Player tier has been successfully updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update player",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: EditPlayerData) => {
    updatePlayerMutation.mutate(data);
  };

  useEffect(() => {
    if (player && gameMode && open) {
      const currentTier = getTierForGameModeLocal(player, gameMode);
      form.reset({ name: player.name, tier: currentTier });
    }
  }, [player, gameMode, open, form]);

  const getTierForGameModeLocal = (player: Player, gameMode: GameMode): string => {
    switch (gameMode) {
      case "skywars": return player.skywarsTier;
      case "midfight": return player.midfightTier;
      case "uhc": return player.uhcTier;
      case "nodebuff": return player.nodebuffTier;
      case "bedfight": return player.bedfightTier;
      default: return "NR";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md" data-testid="edit-player-dialog">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
        </DialogHeader>
        {player && gameMode && (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-12 h-12 border-2 border-border/30">
                <AvatarImage 
                  src={`https://mc-heads.net/avatar/${player.name}/64`}
                  alt={`${player.name}'s skin`}
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{player.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {gameModes.find(m => m.key === gameMode)?.name || gameMode}
                </p>
              </div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="edit-player-name-input" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier for {gameModes.find(m => m.key === gameMode)?.name}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="edit-player-tier-select">
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tierOptions.map((tier) => (
                            <SelectItem key={tier} value={tier}>
                              {tier === "NR" ? "Not Ranked" : tier}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={updatePlayerMutation.isPending}
                    data-testid="edit-player-submit"
                  >
                    {updatePlayerMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                    data-testid="edit-player-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog({ open, onClose, onConfirm, playerName, gameMode }: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent data-testid="delete-confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            {gameMode 
              ? `Are you sure you want to remove ${playerName} from ${gameMode}? This will set their tier to "Not Ranked" for this game mode.`
              : `Are you sure you want to permanently delete ${playerName}? This will remove them from all game modes.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="delete-cancel">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} data-testid="delete-confirm">
            {gameMode ? "Remove from Game Mode" : "Delete Player"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminPanel({ onClose, onAdminLogin, editingPlayer: initialEditingPlayer, isAuthenticated: externalIsAuthenticated = false }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(externalIsAuthenticated);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>("overall");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showOverallEditDialog, setShowOverallEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editingGameMode, setEditingGameMode] = useState<GameMode | undefined>();
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);
  const [deletingGameMode, setDeletingGameMode] = useState<string | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sync external authentication state with local state
  useEffect(() => {
    setIsAuthenticated(externalIsAuthenticated);
  }, [externalIsAuthenticated]);

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    enabled: isAuthenticated,
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });


  const loginMutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      if (data.password === "mmcadminpaneltwin123") {
        return { success: true };
      } else {
        throw new Error("Invalid password");
      }
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      onAdminLogin?.();
      toast({
        title: "Login successful",
        description: "Welcome to MMC Admin Panel",
      });
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid admin password",
        variant: "destructive",
      });
    },
  });



  const deletePlayerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Player deleted",
        description: "Player has been successfully removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete player",
        variant: "destructive",
      });
    },
  });

  const removeFromGameModeMutation = useMutation({
    mutationFn: async ({ playerId, gameMode }: { playerId: string; gameMode: string }) => {
      const updateData: Partial<InsertPlayer> = {};
      const gameModeField = `${gameMode}Tier` as keyof InsertPlayer;
      (updateData as any)[gameModeField] = "NR";
      
      const response = await apiRequest("PATCH", `/api/players/${playerId}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Player removed from game mode",
        description: "Player has been set to Not Ranked for this game mode",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove player from game mode",
        variant: "destructive",
      });
    },
  });


  const handleLogin = (data: { password: string }) => {
    loginMutation.mutate(data);
  };


  const getTierForGameMode = (player: Player, gameMode: GameMode): string => {
    switch (gameMode) {
      case "skywars": return player.skywarsTier;
      case "midfight": return player.midfightTier;
      case "uhc": return player.uhcTier;
      case "nodebuff": return player.nodebuffTier;
      case "bedfight": return player.bedfightTier;
      case "overall":
        const tiers = [
          player.skywarsTier, player.midfightTier, player.uhcTier,
          player.nodebuffTier, player.bedfightTier
        ].filter(tier => tier !== "NR");
        
        if (tiers.length === 0) return "NR";
        
        const tierOrder = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5"];
        for (const tier of tierOrder) {
          if (tiers.includes(tier)) return tier;
        }
        return "NR";
      default: return "NR";
    }
  };

  const handlePlayerReorder = async (player: Player, direction: 'up' | 'down', sortedPlayers: Player[], currentIndex: number) => {
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedPlayers.length - 1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetPlayer = sortedPlayers[targetIndex];
    
    // Get overall tier for both players
    const currentTier = getTierForGameMode(player, 'overall');
    const targetTier = getTierForGameMode(targetPlayer, 'overall');
    
    // Get tier hierarchy for validation  
    const tierOrder = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5", "NR"];
    const currentTierLevel = tierOrder.indexOf(currentTier);
    const targetTierLevel = tierOrder.indexOf(targetTier);
    
    // Check if move would violate tier hierarchy
    if (direction === 'up' && currentTierLevel > targetTierLevel) {
      toast({
        title: "Cannot move up",
        description: `Cannot move ${currentTier} player above ${targetTier} player. First change the tier to ${targetTier} or higher to enable this move.`,
        variant: "destructive",
      });
      return;
    }
    
    if (direction === 'down' && currentTierLevel < targetTierLevel) {
      toast({
        title: "Cannot move down", 
        description: `Cannot move ${currentTier} player below ${targetTier} player. First change the tier to ${targetTier} or lower to enable this move.`,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Reorder functionality",
      description: "Player reordering is available via drag and drop on the main tier list view. Use the tier list to reorder players within and between tiers.",
    });
  };

  const filteredPlayers = players.filter((player) => {
    if (selectedGameMode === "overall") {
      return calculatePlayerPoints(player) > 0; // Show players with points > 0
    }
    const tier = getTierForGameMode(player, selectedGameMode);
    return tier !== "NR";
  }).sort((a, b) => {
    if (selectedGameMode === "overall") {
      return calculatePlayerPoints(b) - calculatePlayerPoints(a); // Sort by points descending
    }
    return 0;
  });

  const getPlayersForTier = (tierKey: string) => {
    const tierLevel = tierLevels.find(t => t.key === tierKey);
    if (!tierLevel) return [];

    const tieredPlayers = filteredPlayers.filter(player => {
      const playerTier = getTierForGameMode(player, selectedGameMode);
      return (tierLevel.tiers as readonly string[]).includes(playerTier);
    });

    // Sort players within the tier level according to tier order (HT1 > MIDT1 > LT1, etc.)
    const tierOrder = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5", "NR"];
    return tieredPlayers.sort((a, b) => {
      const aTier = getTierForGameMode(a, selectedGameMode);
      const bTier = getTierForGameMode(b, selectedGameMode);
      return tierOrder.indexOf(aTier) - tierOrder.indexOf(bTier);
    });
  };

  const handlePlayerEdit = (player: Player, gameMode?: GameMode) => {
    setEditingPlayer(player);
    if (selectedGameMode === "overall") {
      setShowOverallEditDialog(true);
    } else {
      setEditingGameMode(gameMode || selectedGameMode);
      setShowEditDialog(true);
    }
  };

  const handlePlayerDelete = (player: Player, gameMode?: string) => {
    setDeletingPlayer(player);
    setDeletingGameMode(gameMode);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!deletingPlayer) return;
    
    if (deletingGameMode && deletingGameMode !== "overall") {
      removeFromGameModeMutation.mutate({
        playerId: deletingPlayer.id,
        gameMode: deletingGameMode
      });
    } else {
      deletePlayerMutation.mutate(deletingPlayer.id);
    }
    
    setShowDeleteDialog(false);
    setDeletingPlayer(null);
    setDeletingGameMode(undefined);
  };





  if (!isAuthenticated) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="w-full max-w-md" data-testid="login-modal">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
          </DialogHeader>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter admin password"
                        {...field}
                        data-testid="password-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loginMutation.isPending}
                  data-testid="login-button"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  data-testid="cancel-login-button"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="admin-panel">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Admin Panel</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-admin-button">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto" data-testid="admin-panel">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Admin Panel</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowAddDialog(true)}
                  size="sm"
                  data-testid="add-player-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-admin-button">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Game Mode Tabs */}
            <Tabs value={selectedGameMode} onValueChange={(value) => setSelectedGameMode(value as GameMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-card/80 backdrop-blur-sm border border-border/50">
                {(gameModes as readonly any[]).map((gameMode: any) => (
                  <TabsTrigger
                    key={gameMode.key}
                    value={gameMode.key}
                    className="flex items-center gap-2 gamemode-tab-inactive data-[state=active]:gamemode-tab-active px-4 py-3 font-medium"
                    data-testid={`admin-gamemode-tab-${gameMode.key}`}
                  >
                    <span className="text-sm">{gameMode.icon}</span>
                    <span className="text-sm font-medium">{gameMode.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overall" className="space-y-6">
                {/* Overall Leaderboard */}
                <Card className="bg-card/30 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {(() => {
                        const sortedPlayers = filteredPlayers.sort((a, b) => {
                          const aHighest = getTierForGameMode(a, 'overall');
                          const bHighest = getTierForGameMode(b, 'overall');
                          const tierOrder = ["HT1", "MIDT1", "LT1", "HT2", "MIDT2", "LT2", "HT3", "MIDT3", "LT3", "HT4", "MIDT4", "LT4", "HT5", "MIDT5", "LT5", "NR"];
                          return tierOrder.indexOf(aHighest) - tierOrder.indexOf(bHighest);
                        });
                        return sortedPlayers.map((player, index) => (
                          <div key={player.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`admin-leaderboard-player-${player.id}`}>
                            {/* Ranking */}
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg bg-muted text-muted-foreground minecraft-font">
                              #{index + 1}
                            </div>
                            
                            {/* Player Info */}
                            <div className="flex items-center gap-3 flex-1">
                              <Avatar className="w-12 h-12 border-2 border-border/30">
                                <AvatarImage 
                                  src={`https://mc-heads.net/avatar/${player.name}/64`}
                                  alt={`${player.name}'s skin`}
                                />
                                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                  {player.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-lg">{player.name}</h3>
                                <p className="text-sm text-muted-foreground">{getTitleFromPoints(calculatePlayerPoints(player))}</p>
                              </div>
                            </div>
                            
                            {/* Overall Tier and Mode Badges */}
                            <div className="flex flex-col items-end gap-2">
                              {/* Overall Points */}
                              <div className="text-sm font-bold text-muted-foreground">
                                Points: <span className="text-foreground">{calculatePlayerPoints(player)}</span>
                              </div>
                              
                              {/* Gamemode Badges */}
                              <div className="flex gap-2 flex-wrap">
                                {[
                                  { key: 'skywars', tier: player.skywarsTier, abbr: 'SW', name: 'Skywars' },
                                  { key: 'midfight', tier: player.midfightTier, abbr: 'Midf', name: 'Midfight' },
                                  { key: 'uhc', tier: player.uhcTier, abbr: 'UHC', name: 'UHC' },
                                  { key: 'nodebuff', tier: player.nodebuffTier, abbr: 'NoDb', name: 'Nodebuff' },
                                  { key: 'bedfight', tier: player.bedfightTier, abbr: 'Bed', name: 'Bedfight' }
                                ].map(mode => {
                                  if (!mode.tier || mode.tier === 'NR') {
                                    return (
                                      <div key={mode.key} className="px-2 py-1 rounded-md bg-gradient-to-r from-gray-600 to-gray-700 text-xs font-bold text-gray-200 shadow-sm border border-gray-500" title={`${mode.name}: Not Ranked`}>
                                        {mode.abbr}: NR
                                      </div>
                                    );
                                  }
                                  
                                  const tierColor = mode.tier.startsWith('HT') ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-md border border-red-400' :
                                                  mode.tier.startsWith('MIDT') ? 'bg-gradient-to-r from-orange-500 to-yellow-500 shadow-md border border-orange-400' :
                                                  mode.tier.startsWith('LT') ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-md border border-blue-400' : 'bg-gradient-to-r from-gray-500 to-gray-600 shadow-md border border-gray-400';
                                  
                                  return (
                                    <div key={mode.key} className={`px-2 py-1 rounded-md ${tierColor} text-xs font-bold text-white backdrop-blur-sm`} title={`${mode.name}: ${mode.tier}`}>
                                      {mode.abbr}: {mode.tier}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Admin Actions */}
                            <div className="flex gap-2">
                              {/* Reorder Buttons */}
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayerReorder(player, 'up', sortedPlayers, index);
                                  }}
                                  disabled={index === 0}
                                  className="w-8 h-6 p-0"
                                  data-testid={`admin-reorder-up-${player.id}`}
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayerReorder(player, 'down', sortedPlayers, index);
                                  }}
                                  disabled={index === sortedPlayers.length - 1}
                                  className="w-8 h-6 p-0"
                                  data-testid={`admin-reorder-down-${player.id}`}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayerEdit(player);
                                }}
                                data-testid={`admin-edit-player-${player.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayerDelete(player);
                                }}
                                data-testid={`admin-delete-player-${player.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Individual Gamemode Tier Lists */}
              {(gameModes as readonly any[]).filter((mode: any) => mode.key !== 'overall').map((gameMode: any) => (
                <TabsContent key={gameMode.key} value={gameMode.key} className="space-y-6">
                  {/* Vertical Tier List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {tierLevels.map((tierLevel) => {
                      const tieredPlayers = getPlayersForTier(tierLevel.key);
                      return (
                        <Card 
                          key={tierLevel.key} 
                          className="min-h-[400px] bg-card/30 backdrop-blur-sm border-border/50"
                          data-testid={`admin-tier-section-${tierLevel.key}`}
                        >
                          <CardHeader className="pb-3">
                            <div className={`text-center py-3 px-4 rounded-lg bg-gradient-to-r ${tierLevel.color}`}>
                              <h3 className={`font-bold text-lg ${tierLevel.textColor} tier-title`}>
                                {tierLevel.key}
                              </h3>
                              <p className={`text-sm ${tierLevel.textColor} opacity-90`}>
                                {tierLevel.name}
                              </p>
                              <p className={`text-xs ${tierLevel.textColor} opacity-75 mt-1`}>
                                Players: {tieredPlayers.length}
                              </p>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {tieredPlayers.length > 0 ? (
                              tieredPlayers.map((player, index) => (
                                <div key={player.id} className="group relative">
                                  <PlayerCard
                                    player={player}
                                    ranking={index + 1}
                                    isAdmin={true}
                                    simplified={true}
                                    onEdit={(player) => handlePlayerEdit(player, selectedGameMode)}
                                    onDelete={(id) => {
                                      const player = tieredPlayers.find(p => p.id === id);
                                      if (player) handlePlayerDelete(player, selectedGameMode);
                                    }}
                                  />
                                  {/* Delete button overlay */}
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-6 h-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlayerDelete(player, selectedGameMode);
                                    }}
                                    data-testid={`admin-delete-gamemode-player-${player.id}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">No players in this tier</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <AddPlayerDialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
        onSuccess={() => setShowAddDialog(false)}
      />
      
      <EditPlayerDialog 
        open={showEditDialog} 
        onClose={() => {
          setShowEditDialog(false);
          setEditingPlayer(null);
          setEditingGameMode(undefined);
        }}
        player={editingPlayer}
        gameMode={editingGameMode}
        onSuccess={() => {
          setShowEditDialog(false);
          setEditingPlayer(null);
          setEditingGameMode(undefined);
        }}
      />
      
      <OverallEditDialog 
        open={showOverallEditDialog} 
        onClose={() => {
          setShowOverallEditDialog(false);
          setEditingPlayer(null);
        }}
        player={editingPlayer}
        onSuccess={() => {
          setShowOverallEditDialog(false);
          setEditingPlayer(null);
        }}
      />
      
      <DeleteConfirmDialog 
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingPlayer(null);
          setDeletingGameMode(undefined);
        }}
        onConfirm={confirmDelete}
        playerName={deletingPlayer?.name || ""}
        gameMode={deletingGameMode}
      />
    </>
  );
}
