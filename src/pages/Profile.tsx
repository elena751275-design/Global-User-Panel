import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/profile/${user._id}`);
        const data = await response.json();
        if (data.success && data.profile) {
          setUsername(data.profile.username || "");
          setFullName(data.profile.fullName || "");
        } else {
          throw new Error(data.message || "Failed to load profile");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (username.trim().length < 2 || username.trim().length > 30) {
      toast.error("Username must be 2-30 characters");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          username: username.trim(),
          fullName: fullName.trim(),
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Profile updated successfully!");
        navigate("/mine");
      } else {
        throw new Error(result.message || "Failed to update profile.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Profile" />

      <div className="px-5 pt-5">
        <Card className="p-5 bg-card border border-border rounded-2xl shadow-[var(--shadow-tile)]">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email ?? ""} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  maxLength={30}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  maxLength={60}
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;