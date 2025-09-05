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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, Edit, Trash2 } from "lucide-react";
import { insertPlayerSchema, tierOptions, titleOptions, type Player, type InsertPlayer } from "@shared/schema";
import { z } from "zod";

interface AdminPanelProps {
  onClose: () => void;
  onAdminLogin?: () => void;
  editingPlayer?: Player | null;
}

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export function AdminPanel({ onClose, onAdminLogin, editingPlayer: initialEditingPlayer }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(initialEditingPlayer || null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
    enabled: isAuthenticated,
  });

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });

  const playerForm = useForm<InsertPlayer>({
    resolver: zodResolver(insertPlayerSchema),
    defaultValues: {
      name: "",
      title: "Combat Specialist",
      bridgeTier: "NR",
      skywarsTier: "NR",
      crystalTier: "NR",
      midfightTier: "NR",
      uhcTier: "NR",
      nodebuffTier: "NR",
      bedfightTier: "NR",
      sumoTier: "NR",
      isRetired: false,
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

  const createPlayerMutation = useMutation({
    mutationFn: async (data: InsertPlayer) => {
      const response = await apiRequest("POST", "/api/players", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      playerForm.reset();
      toast({
        title: "Player created",
        description: "Player has been successfully added",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create player",
        variant: "destructive",
      });
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertPlayer }) => {
      const response = await apiRequest("PATCH", `/api/players/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setEditingPlayer(null);
      playerForm.reset();
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

  useEffect(() => {
    if (initialEditingPlayer && isAuthenticated) {
      setEditingPlayer(initialEditingPlayer);
      playerForm.reset({
        name: initialEditingPlayer.name,
        title: initialEditingPlayer.title,
        bridgeTier: initialEditingPlayer.bridgeTier,
        skywarsTier: initialEditingPlayer.skywarsTier,
        crystalTier: initialEditingPlayer.crystalTier,
        midfightTier: initialEditingPlayer.midfightTier,
        uhcTier: initialEditingPlayer.uhcTier,
        nodebuffTier: initialEditingPlayer.nodebuffTier,
        bedfightTier: initialEditingPlayer.bedfightTier,
        sumoTier: initialEditingPlayer.sumoTier,
      });
    }
  }, [initialEditingPlayer, isAuthenticated]);

  const handleLogin = (data: { password: string }) => {
    loginMutation.mutate(data);
  };

  const handlePlayerSubmit = (data: InsertPlayer) => {
    if (editingPlayer) {
      updatePlayerMutation.mutate({ id: editingPlayer.id, data });
    } else {
      createPlayerMutation.mutate(data);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    playerForm.reset({
      name: player.name,
      title: player.title,
      bridgeTier: player.bridgeTier,
      skywarsTier: player.skywarsTier,
      crystalTier: player.crystalTier,
      midfightTier: player.midfightTier,
      uhcTier: player.uhcTier,
      nodebuffTier: player.nodebuffTier,
      bedfightTier: player.bedfightTier,
      sumoTier: player.sumoTier,
      isRetired: player.isRetired,
    });
  };

  const handleDeletePlayer = (id: string) => {
    if (confirm("Are you sure you want to delete this player?")) {
      deletePlayerMutation.mutate(id);
    }
  };

  const handleClearForm = () => {
    setEditingPlayer(null);
    playerForm.reset();
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
          {/* Player Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingPlayer ? `Edit Player: ${editingPlayer.name}` : "Add New Player"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...playerForm}>
                <form onSubmit={playerForm.handleSubmit(handlePlayerSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={playerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Player Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="player-name-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={playerForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Combat Title</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="combat-title-select">
                                <SelectValue placeholder="Select title" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {titleOptions.map((title) => (
                                <SelectItem key={title} value={title}>
                                  {title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(["skywarsTier", "midfightTier", "uhcTier", "nodebuffTier", "bedfightTier"] as const).map((field) => (
                      <FormField
                        key={field}
                        control={playerForm.control}
                        name={field}
                        render={({ field: formField }) => (
                          <FormItem>
                            <FormLabel>
                              {field.replace("Tier", "").replace(/([A-Z])/g, " $1").trim()} Tier
                            </FormLabel>
                            <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                              <FormControl>
                                <SelectTrigger data-testid={`${field}-select`}>
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

                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <Button
                        type="submit"
                        disabled={createPlayerMutation.isPending || updatePlayerMutation.isPending}
                        data-testid="save-player-button"
                      >
                        {editingPlayer ? "Update Player" : "Add Player"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearForm}
                        data-testid="clear-form-button"
                      >
                        Clear Form
                      </Button>
                    </div>
                    
                    {/* Skin Customization */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm mb-2">Skin Preview</h4>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={`https://mc-heads.net/avatar/${playerForm.watch('name') || 'Steve'}/64`}
                          alt="Skin preview"
                          className="w-12 h-12 border rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'https://mc-heads.net/avatar/Steve/64';
                          }}
                        />
                        <div className="text-sm text-muted-foreground">
                          Skin automatically loaded from player name
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Player Management */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 text-left">Player</th>
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {players.map((player) => (
                      <tr key={player.id} data-testid={`admin-player-row-${player.id}`}>
                        <td className="px-4 py-2 font-medium">{player.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{player.title}</td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPlayer(player)}
                              data-testid={`edit-player-${player.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePlayer(player.id)}
                              data-testid={`delete-player-${player.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
