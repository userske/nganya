"use client";

import { useState, useMemo } from "react";
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
  RefreshCw,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Check,
  Filter,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  updateEventSettingsAction,
  toggleCategoryStatusAction,
} from "@/app/actions/admin";
import { toast } from "sonner";
import { format } from "date-fns";

interface AdminDashboardClientProps {
  initialSettings: any;
  categories: any[];
  orders: any[];
  ticketTiers?: any[];
  suspiciousIps: any[];
  auditLogs: any[];
  totalVotes: number;
  adminUser?: {
    id: string;
    email: string;
  };
}

export function AdminDashboardClient({
  initialSettings,
  categories,
  orders,
  ticketTiers = [],
  suspiciousIps,
  auditLogs,
  totalVotes,
  adminUser,
}: AdminDashboardClientProps) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [categoriesList, setCategoriesList] = useState(categories || []);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [isSeeding, setIsSeeding] = useState(false);

  // Financial & Ticketing Metrics
  const confirmedOrders = useMemo(() => {
    return (orders || []).filter((o) => o.status === "confirmed");
  }, [orders]);

  const grossRevenueKes = useMemo(() => {
    return confirmedOrders.reduce((sum, o) => sum + (Number(o.total_amount_kes) || 0), 0);
  }, [confirmedOrders]);

  const totalTicketsIssued = useMemo(() => {
    return confirmedOrders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
  }, [confirmedOrders]);

  const activeCategoriesCount = useMemo(() => {
    return categoriesList.filter((c) => c.is_active).length;
  }, [categoriesList]);

  // Unique category groups
  const categoryGroups = useMemo(() => {
    const groups = new Set<string>();
    categoriesList.forEach((c) => {
      if (c.group_name) groups.add(c.group_name);
    });
    return Array.from(groups);
  }, [categoriesList]);

  // Deduplicated unique ticket tiers (prevent duplicate cards in utilization)
  const uniqueTiers = useMemo(() => {
    const map = new Map<string, any>();
    for (const tier of ticketTiers) {
      const key = (tier.name || "").trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, { ...tier });
      } else {
        const existing = map.get(key);
        existing.sold_count = (existing.sold_count || 0) + (tier.sold_count || 0);
        existing.capacity = (existing.capacity || 0) + (tier.capacity || 0);
      }
    }
    return Array.from(map.values());
  }, [ticketTiers]);

  // Save Settings Handler
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        toast.success("Event operations settings saved!");
      } else {
        toast.error("Failed to update settings", { description: res.error });
      }
    } catch {
      toast.error("Network error while saving settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Quick Toggle Handler
  const handleQuickToggle = async (key: string, value: boolean) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    try {
      const res = await updateEventSettingsAction({
        eventName: nextSettings.event_name,
        tagline: nextSettings.tagline,
        eventDate: nextSettings.event_date,
        eventTime: nextSettings.event_time,
        venueName: nextSettings.venue_name,
        ticketSalesOpen: Boolean(nextSettings.ticket_sales_open),
        resultsFrozen: Boolean(nextSettings.results_frozen),
        votingOpensAt: nextSettings.voting_opens_at,
        votingClosesAt: nextSettings.voting_closes_at,
      });

      if (res.success) {
        toast.success(`${key.replace(/_/g, " ")} is now ${value ? "ENABLED" : "DISABLED"}`);
      } else {
        toast.error("Toggle failed", { description: res.error });
      }
    } catch {
      toast.error("Network error on toggle.");
    }
  };

  // Toggle single category
  const handleToggleCategory = async (categoryId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setCategoriesList((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, is_active: nextStatus } : c))
    );

    try {
      const res = await toggleCategoryStatusAction(categoryId, nextStatus);
      if (res.success) {
        toast.success(`Category ${nextStatus ? "activated" : "deactivated"}`);
      } else {
        toast.error("Failed to update category status");
      }
    } catch {
      toast.error("Network error while updating category status.");
    }
  };

  // Seed Database Handler
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success(
          `Database populated! Seeded ${json.categoriesCount} categories & ${json.nomineesCount} nominees.`
        );
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error("Failed to seed database", { description: json.error });
      }
    } catch {
      toast.error("Network error while seeding database");
    } finally {
      setIsSeeding(false);
    }
  };

  // Filters
  const filteredCategories = useMemo(() => {
    return categoriesList.filter((c) => {
      const matchesSearch =
        (c.name || "").toLowerCase().includes(categorySearch.toLowerCase()) ||
        (c.group_name || "").toLowerCase().includes(categorySearch.toLowerCase());
      const matchesGroup =
        selectedGroup === "all" || c.group_name === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [categoriesList, categorySearch, selectedGroup]);

  const filteredOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      const matchesSearch =
        (o.order_number || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.buyer_name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.buyer_phone || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.buyer_email || "").toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus =
        orderStatusFilter === "all" || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. COMMAND CENTER HEADER & LIVE STATUS
      ───────────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#141414] via-[#0c0c0c] to-[#080808] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Command Operations
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Admin: {adminUser?.email || "Super Admin"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Executive Control Panel
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
              Real-time governance for Coastal Nganya Awards 2026. Manage 61 award categories,
              ticket sales inventory, gate security QR scanning, and live vote verification.
            </p>
          </div>

          {/* Quick Access Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold h-11 px-5 rounded-xl shadow-lg shadow-amber-400/10"
            >
              <Link href="/admin/scan">
                <Camera className="w-4 h-4 mr-2" />
                Gate QR Scanner
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold h-11 px-4 rounded-xl text-xs"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-amber-400" />
                  Seeding DB...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 text-amber-400" />
                  Seed 61 Categories
                </>
              )}
            </Button>

            <Button
              asChild
              variant="ghost"
              className="border border-white/10 hover:bg-white/5 text-white/80 h-11 px-4 rounded-xl text-xs"
            >
              <Link href="/results" target="_blank">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Public Tally
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Key Executive Metrics Bar ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* 1. Verified Votes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Vote className="w-3.5 h-3.5 text-amber-400" />
                Verified Votes
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Counted</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {totalVotes.toLocaleString()}
            </div>
            <div className="text-[11px] text-white/40 font-mono mt-1">
              Across {categoriesList.length} categories
            </div>
          </div>

          {/* 2. Gross Ticket Sales */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Gross Revenue
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Paystack Live</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
              KES {grossRevenueKes.toLocaleString()}
            </div>
            <div className="text-[11px] text-white/40 font-mono mt-1">
              {confirmedOrders.length} confirmed orders
            </div>
          </div>

          {/* 3. Passes Issued */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                Passes Issued
              </span>
              <span className="text-[10px] text-white/50 font-mono">Gate Ready</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {totalTicketsIssued}
              <span className="text-xs text-white/40 font-normal ml-1">passes</span>
            </div>
            <div className="text-[11px] text-white/40 font-mono mt-1">
              Dec 6 · Mamba Village
            </div>
          </div>

          {/* 4. Active Categories */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Active Ballots
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Open</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {activeCategoriesCount}
              <span className="text-xs text-white/40 font-normal ml-1">/ {categoriesList.length}</span>
            </div>
            <div className="text-[11px] text-white/40 font-mono mt-1">
              100% database backed
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MASTER DASHBOARD TABS
      ───────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="w-full flex flex-col gap-6">
        <TabsList className="bg-[#111111] border border-white/10 p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 w-full">
          <TabsTrigger
            value="overview"
            className="rounded-xl text-xs sm:text-sm py-2 px-3.5 data-[state=active]:bg-amber-400 data-[state=active]:text-black data-active:bg-amber-400 data-active:text-black font-bold transition-all shrink-0"
          >
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Overview
          </TabsTrigger>

          <TabsTrigger
            value="settings"
            className="rounded-xl text-xs sm:text-sm py-2 px-3.5 data-[state=active]:bg-amber-400 data-[state=active]:text-black data-active:bg-amber-400 data-active:text-black font-bold transition-all shrink-0"
          >
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Event Settings
          </TabsTrigger>

          <TabsTrigger
            value="categories"
            className="rounded-xl text-xs sm:text-sm py-2 px-3.5 data-[state=active]:bg-amber-400 data-[state=active]:text-black data-active:bg-amber-400 data-active:text-black font-bold transition-all shrink-0"
          >
            <Trophy className="w-3.5 h-3.5 mr-1.5" />
            Categories ({categoriesList.length})
          </TabsTrigger>

          <TabsTrigger
            value="tickets"
            className="rounded-xl text-xs sm:text-sm py-2 px-3.5 data-[state=active]:bg-amber-400 data-[state=active]:text-black data-active:bg-amber-400 data-active:text-black font-bold transition-all shrink-0"
          >
            <Ticket className="w-3.5 h-3.5 mr-1.5" />
            Tickets & Orders ({orders.length})
          </TabsTrigger>

          <TabsTrigger
            value="security"
            className="rounded-xl text-xs sm:text-sm py-2 px-3.5 data-[state=active]:bg-amber-400 data-[state=active]:text-black data-active:bg-amber-400 data-active:text-black font-bold transition-all shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
            Anti-Abuse Monitor
          </TabsTrigger>

          <TabsTrigger
            value="audit"
            className="rounded-xl text-xs sm:text-sm py-2 px-3.5 data-[state=active]:bg-amber-400 data-[state=active]:text-black data-active:bg-amber-400 data-active:text-black font-bold transition-all shrink-0"
          >
            <History className="w-3.5 h-3.5 mr-1.5" />
            Audit Log ({auditLogs.length})
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════
            TAB 1: COMMAND OVERVIEW & QUICK TOGGLES
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          {/* Quick Toggles Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Toggle 1: Ticket Sales Gate */}
            <div className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Ticket Sales Gate</h3>
                  <Badge
                    variant="outline"
                    className={
                      settings.ticket_sales_open
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]"
                    }
                  >
                    {settings.ticket_sales_open ? "Sales Active" : "Sales Paused"}
                  </Badge>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Controls whether the public can complete checkout on <code className="text-white/70">/tickets</code>.
                </p>
              </div>

              <Switch
                checked={Boolean(settings.ticket_sales_open)}
                onCheckedChange={(checked) => handleQuickToggle("ticket_sales_open", checked)}
              />
            </div>

            {/* Toggle 2: Freeze Public Leaderboard */}
            <div className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Freeze Public Results</h3>
                  <Badge
                    variant="outline"
                    className={
                      settings.results_frozen
                        ? "bg-amber-400/10 text-amber-400 border-amber-400/30 text-[10px]"
                        : "bg-white/10 text-white/60 border-white/20 text-[10px]"
                    }
                  >
                    {settings.results_frozen ? "Frozen (Blackout)" : "Live Tally"}
                  </Badge>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  When frozen, vote counts on <code className="text-white/70">/results</code> stop updating to build suspense.
                </p>
              </div>

              <Switch
                checked={Boolean(settings.results_frozen)}
                onCheckedChange={(checked) => handleQuickToggle("results_frozen", checked)}
              />
            </div>
          </div>

          {/* Ticket Tier Breakdown */}
          {ticketTiers && ticketTiers.length > 0 && (
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0d0d0d] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight">
                    Ticket Tiers & Capacity Utilization
                  </h3>
                  <p className="text-xs text-white/50">
                    Live ticket sales tracking by category tier.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="border-white/15 text-xs text-white">
                  <Link href="/tickets" target="_blank">
                    View Checkout Page &rarr;
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {uniqueTiers.map((tier) => {
                  const sold = Number(tier.sold_count) || 0;
                  const cap = Number(tier.capacity) || 100;
                  const pct = Math.min(100, Math.round((sold / cap) * 100));

                  return (
                    <div
                      key={tier.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{tier.name}</span>
                        <span className="font-mono text-amber-400 text-xs font-bold">
                          KES {Number(tier.price_kes).toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-white/50 font-mono">
                          <span>Sold: {sold} / {cap}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Orders Snapshot */}
          <div className="p-6 rounded-3xl bg-[#0d0d0d] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Recent Ticket Transactions
                </h3>
                <p className="text-xs text-white/50">
                  Latest Paystack transactions processed.
                </p>
              </div>
              <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                {confirmedOrders.length} Paid Orders
              </Badge>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-xs font-mono">
                No orders recorded yet. Checkout attempts will show up here in real time.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {orders.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="py-3.5 flex items-center justify-between gap-4 text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{o.order_number}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                            o.status === "confirmed"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/10 text-white/60"
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <div className="text-white/40 text-[11px] font-sans mt-0.5">
                        {o.buyer_name} · {o.buyer_phone || o.buyer_email}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-amber-400">
                        KES {Number(o.total_amount_kes).toLocaleString()}
                      </div>
                      <div className="text-white/30 text-[11px]">
                        {o.quantity} ticket{o.quantity > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 2: EVENT SETTINGS
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="settings" className="space-y-6 outline-none">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0d0d] border border-white/10 max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                Event Schedule & Venue Configuration
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Updates appear live across the homepage, tickets checkout, emails, and footer.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-white/70">Event Name</Label>
                  <Input
                    value={settings.event_name || ""}
                    onChange={(e) => setSettings({ ...settings, event_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/70">Tagline</Label>
                  <Input
                    value={settings.tagline || ""}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/70">Event Date</Label>
                  <Input
                    type="date"
                    value={settings.event_date || ""}
                    onChange={(e) => setSettings({ ...settings, event_date: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/70">Event Time</Label>
                  <Input
                    type="time"
                    value={settings.event_time || ""}
                    onChange={(e) => setSettings({ ...settings, event_time: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <Label className="text-xs text-white/70">Venue Name</Label>
                  <Input
                    value={settings.venue_name || ""}
                    onChange={(e) => setSettings({ ...settings, venue_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Master Switches */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div>
                    <div className="text-sm font-bold text-white">Ticket Sales Gate</div>
                    <div className="text-xs text-white/50">
                      Allow attendees to purchase passes on /tickets
                    </div>
                  </div>
                  <Switch
                    checked={Boolean(settings.ticket_sales_open)}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, ticket_sales_open: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div>
                    <div className="text-sm font-bold text-white">Freeze Public Results</div>
                    <div className="text-xs text-white/50">
                      Lock leaderboard counts from updating publicly on /results
                    </div>
                  </div>
                  <Switch
                    checked={Boolean(settings.results_frozen)}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, results_frozen: checked })
                    }
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSavingSettings}
                className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold h-12 rounded-xl text-sm"
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Configuration...
                  </>
                ) : (
                  "Save Event Settings"
                )}
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 3: CATEGORIES & NOMINEES (61 CATEGORIES)
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="categories" className="space-y-4 outline-none">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search categories (e.g. Sound Beast, Route, Driver)..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white h-10 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3 justify-between sm:justify-end">
              <div className="text-xs text-white/50 font-mono">
                Showing {filteredCategories.length} / {categoriesList.length}
              </div>

              <Button
                size="sm"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs h-9 px-3.5 rounded-xl"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Seed Categories from JSON
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Group Filter Pills */}
          {categoryGroups.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedGroup("all")}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  selectedGroup === "all"
                    ? "bg-amber-400 text-black"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                All Groups ({categoriesList.length})
              </button>
              {categoryGroups.map((group) => {
                const count = categoriesList.filter((c) => c.group_name === group).length;
                return (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                      selectedGroup === group
                        ? "bg-amber-400 text-black"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {group} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Table */}
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d0d0d]">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Group</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-white/40">
                      No categories found. Click &ldquo;Seed Categories from JSON&rdquo; above to populate all 61 official award categories.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-bold text-white">
                        <div>{c.name}</div>
                        <div className="text-[10px] text-white/30 font-mono">{c.slug}</div>
                      </td>
                      <td className="p-3.5 text-white/60 font-mono">
                        {c.group_name || "Special"}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={c.is_active ? "default" : "secondary"}
                          className={
                            c.is_active
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]"
                              : "bg-white/5 text-white/40 text-[10px]"
                          }
                        >
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/vote/${c.slug}`}
                          target="_blank"
                          className="inline-flex items-center text-xs text-amber-400 hover:underline mr-2"
                        >
                          View Ballot
                          <ArrowUpRight className="w-3 h-3 ml-0.5" />
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleCategory(c.id, c.is_active)}
                          className="text-xs text-white/70 hover:text-white h-8"
                        >
                          {c.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 4: TICKETS & ORDERS
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="tickets" className="space-y-4 outline-none">
          <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by order ref, buyer name, phone, or email..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white h-10 text-xs rounded-xl"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              {["all", "confirmed", "pending", "failed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold uppercase font-mono transition-all ${
                    orderStatusFilter === st
                      ? "bg-amber-400 text-black"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d0d0d]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Buyer</th>
                  <th className="p-3.5">Phone / Email</th>
                  <th className="p-3.5">Quantity & Total</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-white/40 font-sans">
                      No orders match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-bold text-white">{o.order_number}</td>
                      <td className="p-3.5 text-white font-sans">{o.buyer_name}</td>
                      <td className="p-3.5 text-white/50 text-[11px]">
                        <div>{o.buyer_phone || "—"}</div>
                        <div className="text-white/30 truncate max-w-[150px]">{o.buyer_email}</div>
                      </td>
                      <td className="p-3.5 text-white">
                        <span className="font-bold text-amber-400">
                          KES {Number(o.total_amount_kes).toLocaleString()}
                        </span>
                        <span className="text-white/40 ml-1.5 text-[11px]">
                          ({o.quantity} {o.quantity === 1 ? "pass" : "passes"})
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            o.status === "confirmed"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : o.status === "pending"
                              ? "bg-amber-400/15 text-amber-400 border border-amber-400/30"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-white/40 text-[11px]">
                        {o.created_at ? format(new Date(o.created_at), "d MMM, h:mm a") : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 5: ANTI-ABUSE & IP SECURITY
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="security" className="space-y-4 outline-none">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0d0d] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Salted IP Cluster Monitoring & Fraud Protection
                </h2>
                <p className="text-xs text-white/50">
                  Kenyan carrier networks (Safaricom, Airtel) heavily utilize shared Carrier-Grade NAT.
                </p>
              </div>
            </div>

            <p className="text-xs text-white/50 leading-relaxed max-w-3xl">
              Voter IPs are salted and hashed with a secret key before logging to ensure privacy.
              Instead of blindly blocking IP clusters (which would unfairly block thousands of legitimate
              mobile voters at the same station or campus), anomalous voting velocity is flagged here for manual audit.
            </p>

            <div className="space-y-3 pt-2">
              {(suspiciousIps || []).length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="text-white text-xs font-semibold">Zero Malicious Spikes Detected</p>
                  <p className="text-white/40 text-xs">
                    All voting rates and IP cluster hashes are within standard human thresholds.
                  </p>
                </div>
              ) : (
                suspiciousIps.map((c, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="text-white font-bold">
                        Hash: {c.ip_hash.substring(0, 16)}...
                      </span>
                      <span className="text-white/40 ml-4">
                        {c.voters_count} voters · {c.votes_count} votes
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 6: AUDIT LOG
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="audit" className="space-y-4 outline-none">
          <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d0d0d]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(auditLogs || []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-white/40 font-sans">
                      No admin actions recorded yet. All administrative actions (e.g. setting toggles, category changes) are automatically logged here.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((a) => (
                    <tr key={a.id} className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-bold text-amber-400">{a.action}</td>
                      <td className="p-3.5 text-white">
                        {a.entity_type} {a.entity_id ? `(#${a.entity_id})` : ""}
                      </td>
                      <td className="p-3.5 text-white/40">
                        {new Date(a.created_at).toLocaleString()}
                      </td>
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
