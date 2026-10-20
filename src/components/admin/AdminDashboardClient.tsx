"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Ticket,
  Vote,
  Settings,
  ShieldAlert,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Camera,
  Download,
  AlertTriangle,
  History,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { updateEventSettingsAction, toggleCategoryStatusAction, voidVoteAction } from "@/app/actions/admin";
import { toast } from "sonner";

interface AdminDashboardClientProps {
  initialSettings: any;
  categories: any[];
  orders: any[];
  suspiciousIps: any[];
  auditLogs: any[];
  totalVotes: number;
}

export function AdminDashboardClient({
  initialSettings,
  categories,
  orders,
  suspiciousIps,
  auditLogs,
  totalVotes,
}: AdminDashboardClientProps) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [categoriesList, setCategoriesList] = useState(categories || []);
  const [categorySearch, setCategorySearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await updateEventSettingsAction({
        eventName: settings.event_name,
        tagline: settings.tagline,
        eventDate: settings.event_date,
        eventTime: settings.event_time,
        venueName: settings.venue_name,
        ticketSalesOpen: Boolean(settings.ticket_sales_open),
        resultsFrozen: Boolean(settings.results_frozen),
        votingOpensAt: settings.voting_opens_at,
        votingClosesAt: settings.voting_closes_at,
      });

      if (res.success) {
        toast.success("Event settings updated successfully!");
      } else {
        toast.error("Failed to update settings:", { description: res.error });
      }
    } catch {
      toast.error("Network error while saving settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleCategory = async (catId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setCategoriesList((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, is_active: newStatus } : c))
    );

    try {
      const res = await toggleCategoryStatusAction(catId, newStatus);
      if (res.success) {
        toast.success(`Category ${newStatus ? "Activated" : "Deactivated"}`);
      } else {
        toast.error("Failed to update category status");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const filteredCategories = categoriesList.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (c.group_name && c.group_name.toLowerCase().includes(categorySearch.toLowerCase()))
  );

  const filteredOrders = (orders || []).filter((o) =>
    o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.buyer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.buyer_phone?.includes(orderSearch)
  );

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
            Administrator Command Center
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Awards Event Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-white hover:bg-white/90 text-black font-semibold text-xs h-10 rounded-xl focus-visible:ring-2 focus-visible:ring-white"
          >
            <Link href="/admin/scan">
              <Camera className="w-4 h-4 mr-2" />
              Open Door Scanner Terminal
            </Link>
          </Button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Verified Votes</span>
            <Vote className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalVotes.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Total Categories</span>
            <Trophy className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {categoriesList.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-white/50 text-xs mb-2">
            <span>Ticket Orders</span>
            <Ticket className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {(orders || []).length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Flagged IP Clusters</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {(suspiciousIps || []).length}
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="settings" className="rounded-xl text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Event Settings
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-xl text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
            <Trophy className="w-3.5 h-3.5 mr-1.5" />
            Categories & Nominees
          </TabsTrigger>
          <TabsTrigger value="tickets" className="rounded-xl text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
            <Ticket className="w-3.5 h-3.5 mr-1.5" />
            Tickets & Orders
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
            Anti-Abuse Monitor
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-xl text-xs py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black font-semibold">
            <History className="w-3.5 h-3.5 mr-1.5" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Event Settings */}
        <TabsContent value="settings" className="mt-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm max-w-3xl">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 pb-4 border-b border-white/10">
              Event Configuration & Voting Controls
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Event Name</Label>
                  <Input
                    value={settings.event_name || ""}
                    onChange={(e) => setSettings({ ...settings, event_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Tagline</Label>
                  <Input
                    value={settings.tagline || ""}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Event Date</Label>
                  <Input
                    type="date"
                    value={settings.event_date || ""}
                    onChange={(e) => setSettings({ ...settings, event_date: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-300">Event Time</Label>
                  <Input
                    type="time"
                    value={settings.event_time || ""}
                    onChange={(e) => setSettings({ ...settings, event_time: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label className="text-xs text-slate-300">Venue Name</Label>
                  <Input
                    value={settings.venue_name || ""}
                    onChange={(e) => setSettings({ ...settings, venue_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Master Toggles */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div>
                    <div className="text-sm font-bold text-white">Ticket Sales Master Switch</div>
                    <div className="text-xs text-slate-400">Controls whether guest checkout is open to the public</div>
                  </div>
                  <Switch
                    checked={Boolean(settings.ticket_sales_open)}
                    onCheckedChange={(val) => setSettings({ ...settings, ticket_sales_open: val })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div>
                    <div className="text-sm font-bold text-white">Freeze Live Results Leaderboard</div>
                    <div className="text-xs text-slate-400">Locks public live tallies after voting period closes</div>
                  </div>
                  <Switch
                    checked={Boolean(settings.results_frozen)}
                    onCheckedChange={(val) => setSettings({ ...settings, results_frozen: val })}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSavingSettings}
                className="bg-white hover:bg-white/90 text-black font-semibold px-8 h-12 rounded-xl focus-visible:ring-2 focus-visible:ring-white"
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Event Settings"
                )}
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* Tab 2: Categories */}
        <TabsContent value="categories" className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white h-10 text-xs"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing {filteredCategories.length} categories
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Group</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-bold text-white">{c.name}</td>
                    <td className="p-3.5 text-slate-400 font-mono">{c.group_name || "Special"}</td>
                    <td className="p-3.5">
                      <Badge
                        variant={c.is_active ? "default" : "secondary"}
                        className={c.is_active ? "bg-white/15 text-white border border-white/20 text-[10px]" : "bg-white/5 text-white/40 text-[10px]"}
                      >
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleCategory(c.id, c.is_active)}
                        className="text-xs text-white/70 hover:text-white"
                      >
                        {c.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 3: Tickets & Orders */}
        <TabsContent value="tickets" className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by order ref, buyer name or phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white h-10 text-xs"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing {filteredOrders.length} orders
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Buyer</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Qty / Total</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No ticket orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-bold text-white font-mono">{o.order_number}</td>
                      <td className="p-3.5 text-white">{o.buyer_name}</td>
                      <td className="p-3.5 text-white/50">{o.buyer_phone}</td>
                      <td className="p-3.5 text-white">
                        {o.quantity} tkts • KES {Number(o.total_amount_kes).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          o.status === "confirmed" ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 4: Anti-Abuse */}
        <TabsContent value="security" className="mt-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
            <h2 className="text-base font-bold text-white uppercase tracking-wider mb-2">
              Salted IP Cluster Monitoring
            </h2>
            <p className="text-xs text-white/50 mb-6 leading-relaxed">
              Kenya networks rely heavily on mobile carrier CGNAT (shared IP). The system logs salted hashes and flags clusters without blocking legitimate shared-network voters. Review clusters with unusually high activity below:
            </p>

            <div className="space-y-3">
              {(suspiciousIps || []).length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-white/70 text-xs text-center">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-white" />
                  No suspicious voting bursts or abnormal voter clusters detected.
                </div>
              ) : (
                suspiciousIps.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-white font-bold">IP Hash: {c.ip_hash.substring(0, 16)}...</span>
                      <span className="text-white/40 ml-4">{c.voters_count} accounts • {c.votes_count} votes</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-8 border-white/20 text-white hover:bg-white/10">
                      Flag / Review Cluster
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 5: Audit Log */}
        <TabsContent value="audit" className="mt-6">
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {(auditLogs || []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-white/40">
                      No admin actions logged yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-bold text-white">{a.action}</td>
                      <td className="p-3.5 text-white">{a.entity_type} {a.entity_id ? `(#${a.entity_id})` : ""}</td>
                      <td className="p-3.5 text-white/40">{new Date(a.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
