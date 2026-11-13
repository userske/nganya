"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Ticket,
  Vote,
  Settings,
  ShieldAlert,
  Search,
  CheckCircle2,
  Camera,
  History,
  Loader2,
  RefreshCw,
  Activity,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Mail,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  updateEventSettingsAction,
  toggleCategoryStatusAction,
  syncPaystackOrderAction,
  resendOrderTicketsAction,
  resendAllConfirmedTicketsAction,
} from "@/app/actions/admin";
import { toast } from "sonner";
import { format } from "date-fns";

type AdminTab = "overview" | "settings" | "categories" | "tickets" | "security" | "audit";

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
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [settings, setSettings] = useState(initialSettings || {});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [categoriesList, setCategoriesList] = useState(categories || []);
  const [ordersList, setOrdersList] = useState(orders || []);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [isSeeding, setIsSeeding] = useState(false);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [resendingOrderId, setResendingOrderId] = useState<string | null>(null);
  const [isResendingAll, setIsResendingAll] = useState(false);

  // Financial & Ticketing Metrics
  const confirmedOrders = useMemo(() => {
    return (ordersList || []).filter((o) => o.status === "confirmed");
  }, [ordersList]);

  const grossRevenueKes = useMemo(() => {
    return confirmedOrders.reduce((acc, o) => acc + (Number(o.total_amount_kes) || 0), 0);
  }, [confirmedOrders]);

  const totalIssuedTickets = useMemo(() => {
    return confirmedOrders.reduce((acc, o) => acc + (Number(o.quantity) || 0), 0);
  }, [confirmedOrders]);

  const activeCategoriesCount = useMemo(() => {
    return (categoriesList || []).filter((c) => c.is_active).length;
  }, [categoriesList]);

  const categoryGroups = useMemo(() => {
    const set = new Set<string>();
    (categoriesList || []).forEach((c) => {
      if (c.group_name) set.add(c.group_name);
    });
    return Array.from(set);
  }, [categoriesList]);

  // Settings Save Handler
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

  // Sync Paystack Order Handler
  const handleSyncPaystackOrder = async (orderNumber: string) => {
    setSyncingOrderId(orderNumber);
    try {
      const res = await syncPaystackOrderAction(orderNumber);
      if (res.success && res.order) {
        setOrdersList((prev) =>
          prev.map((o) => (o.order_number === orderNumber ? { ...o, status: "confirmed" } : o))
        );
        toast.success(`Order ${orderNumber} verified and confirmed! Tickets issued.`);
      } else {
        toast.error("Paystack check complete", {
          description: res.error || "Payment has not yet been completed on Paystack.",
        });
      }
    } catch {
      toast.error("Failed to communicate with Paystack.");
    } finally {
      setSyncingOrderId(null);
    }
  };


  // Resend Ticket QR for a Single Order
  const handleResendOrderTickets = async (orderNumber: string) => {
    setResendingOrderId(orderNumber);
    try {
      const res = await resendOrderTicketsAction(orderNumber);
      if (res.success) {
        toast.success(`QR ticket email sent to ${res.recipient}`, {
          description: `Dispatched ${res.ticketCount} ticket(s) for order ${orderNumber}.`,
        });
      } else {
        toast.error("Resend failed", { description: res.error });
      }
    } catch {
      toast.error("Network error while resending tickets.");
    } finally {
      setResendingOrderId(null);
    }
  };

  // Resend All Confirmed Orders
  const handleResendAllTickets = async () => {
    if (!confirm("Resend QR ticket emails to ALL confirmed buyers? This will email every confirmed order.")) return;
    setIsResendingAll(true);
    try {
      const res = await resendAllConfirmedTicketsAction();
      if (res.sentCount > 0) {
        toast.success(`Sent ${res.sentCount} of ${res.totalOrders} orders`, {
          description: res.failedCount > 0
            ? `${res.failedCount} failed — check audit log.`
            : "All ticket emails dispatched successfully.",
        });
      } else if (res.totalOrders === 0) {
        toast.info("No confirmed orders found to resend.");
      } else {
        toast.error(`All ${res.failedCount} sends failed`, {
          description: res.errors?.[0] || "Check server logs.",
        });
      }
    } catch {
      toast.error("Network error while resending all tickets.");
    } finally {
      setIsResendingAll(false);
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
    return (ordersList || []).filter((o) => {
      const matchesSearch =
        (o.order_number || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.buyer_name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.buyer_phone || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.buyer_email || "").toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus =
        orderStatusFilter === "all" || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ordersList, orderSearch, orderStatusFilter]);

  const navTabs = [
    { id: "overview" as AdminTab, label: "Overview", icon: Activity },
    { id: "settings" as AdminTab, label: "Settings", icon: Settings },
    { id: "categories" as AdminTab, label: `Categories (${categoriesList.length})`, icon: Trophy },
    { id: "tickets" as AdminTab, label: `Tickets (${ordersList.length})`, icon: Ticket },
    { id: "security" as AdminTab, label: "Anti-Abuse", icon: ShieldAlert },
    { id: "audit" as AdminTab, label: `Audit (${auditLogs.length})`, icon: History },
  ];

  return (
    <div className="space-y-8 w-full">
      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          1. COMMAND CENTER HEADER & LIVE STATUS
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="w-full rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-b from-[#141414] via-[#0c0c0c] to-[#080808] p-5 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Operations
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{adminUser?.email || "info@coastalnganyaawards.com"}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Executive Control Panel
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
              Real-time governance for Coastal Nganya Awards 2026. Manage award categories,
              ticket sales inventory, gate security, and live vote verification.
            </p>
          </div>

          {/* Quick Access Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              asChild
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold h-10 px-4 rounded-xl shadow-lg shadow-amber-400/10 text-xs"
            >
              <Link href="/admin/scan">
                <Camera className="w-4 h-4 mr-1.5" />
                Gate Scanner
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold h-10 px-3.5 rounded-xl text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Refresh Data
            </Button>

            <Button
              variant="outline"
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold h-10 px-3.5 rounded-xl text-xs"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-amber-400" />
                  Seeding...
                </>
              ) : (
                "Seed DB"
              )}
            </Button>

            <Button
              asChild
              variant="ghost"
              className="border border-white/10 hover:bg-white/5 text-white/80 h-10 px-3.5 rounded-xl text-xs"
            >
              <Link href="/results" target="_blank">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Public Tally
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Executive Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6">
          {/* 1. Verified Votes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5 text-[11px]">
                <Vote className="w-3.5 h-3.5 text-amber-400" />
                Votes
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Live</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {totalVotes.toLocaleString()}
            </div>
            <div className="text-[11px] text-white/40 font-mono mt-1">
              {categoriesList.length} categories
            </div>
          </div>

          {/* 2. Gross Ticket Sales */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5 text-[11px]">
                <span className="text-amber-400 font-bold">$</span>
                Revenue
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Paystack</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
              KES {grossRevenueKes.toLocaleString()}
            </div>
            <div className="text-[11px] text-white/40 font-mono mt-1">
              {confirmedOrders.length} confirmed orders
            </div>
          </div>

          {/* 3. Total Passes Issued */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5 text-[11px]">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                Passes
              </span>
              <span className="text-[10px] text-white/40 font-mono">Gate</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {totalIssuedTickets}
              <span className="text-xs text-white/40 font-normal ml-1.5">passes</span>
            </div>
            <div className="text-[11px] text-white/40 font-mono mt-1">
              Dec 6, Mamba Village
            </div>
          </div>

          {/* 4. Active Ballots */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/40 uppercase tracking-wider font-semibold flex items-center gap-1.5 text-[11px]">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Ballots
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Open</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {activeCategoriesCount}
              <span className="text-xs text-white/40 font-normal ml-1">/ {categoriesList.length}</span>
            </div>
            <div className="text-[11px] text-white/40 font-mono mt-1">
              Active award categories
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          2. MASTER DASHBOARD TABS (Fluid Apple Segmented Controls)
      â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="w-full flex flex-col space-y-6">
        {/* Horizontally scrollable tab bar */}
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <div
            role="tablist"
            aria-label="Admin Navigation Tabs"
            className="bg-[#121212] border border-white/10 p-1.5 rounded-2xl inline-flex flex-row items-center gap-1.5 min-w-max"
          >
            {navTabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(id)}
                  className={`rounded-xl text-xs sm:text-sm py-2 px-3.5 sm:px-4.5 font-bold transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isActive
                      ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            TAB 1: COMMAND OVERVIEW & QUICK TOGGLES
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "overview" && (
          <div role="tabpanel" className="w-full space-y-6 pt-1">
            {/* Quick Toggles Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Toggle 1: Ticket Sales Gate */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0d0d0d] border border-white/10 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white">Ticket Sales Gate</h3>
                    <Badge
                      variant="outline"
                      className={
                        settings.ticket_sales_open
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]"
                      }
                    >
                      {settings.ticket_sales_open ? "Active" : "Paused"}
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
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0d0d0d] border border-white/10 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white">Freeze Public Results</h3>
                    <Badge
                      variant="outline"
                      className={
                        settings.results_frozen
                          ? "bg-amber-400/10 text-amber-400 border-amber-400/30 text-[10px]"
                          : "bg-white/10 text-white/60 border-white/20 text-[10px]"
                      }
                    >
                      {settings.results_frozen ? "Frozen" : "Live Tally"}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">
                    When frozen, vote counts on <code className="text-white/70">/results</code> stop updating.
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
              <div className="p-5 sm:p-7 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                      Ticket Tiers & Capacity
                    </h3>
                    <p className="text-xs text-white/50">
                      Live sales tracking by tier.
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="border-white/15 text-xs text-white">
                    <Link href="/tickets" target="_blank">
                      View Checkout &rarr;
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ticketTiers.map((tier) => {
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
                              className="bg-amber-400 h-full rounded-full transition-all"
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
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                    Recent Ticket Purchases
                  </h3>
                  <p className="text-xs text-white/50">
                    Latest transactions. Use the Tickets tab to search or verify pending orders.
                  </p>
                </div>
                <Badge variant="outline" className="border-white/20 text-white font-mono text-xs">
                  {confirmedOrders.length} Confirmed
                </Badge>
              </div>

              {ordersList.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-xs font-mono">
                  No orders recorded yet. Purchases will appear here in real time.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {ordersList.slice(0, 6).map((o) => (
                    <div
                      key={o.id}
                      className="py-3 flex items-center justify-between gap-4 text-xs font-mono"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                          <span className="truncate">{o.order_number}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold shrink-0 ${
                              o.status === "confirmed"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : o.status === "pending"
                                ? "bg-amber-400/15 text-amber-400 border border-amber-400/30"
                                : "bg-white/10 text-white/60"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <div className="text-white/40 text-[11px] font-sans mt-0.5 truncate">
                          {o.buyer_name} &middot; {o.buyer_phone || o.buyer_email}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
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
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            TAB 2: EVENT SETTINGS
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "settings" && (
          <div role="tabpanel" className="w-full space-y-6 pt-1">
            <div className="p-5 sm:p-8 rounded-2xl bg-[#0d0d0d] border border-white/10 max-w-3xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
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
                        Lock leaderboard counts from updating on /results
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
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            TAB 3: CATEGORIES & NOMINEES
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "categories" && (
          <div role="tabpanel" className="w-full space-y-4 pt-1">
            {/* Controls Bar */}
            <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white h-10 text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <div className="text-xs text-white/50 font-mono">
                  {filteredCategories.length} / {categoriesList.length}
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
                      Seed from JSON
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Group Filter Pills */}
            {categoryGroups.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedGroup("all")}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                    selectedGroup === "all"
                      ? "bg-amber-400 text-black"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  All ({categoriesList.length})
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
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d0d0d] overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[500px]">
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
                        No categories found. Click &ldquo;Seed from JSON&rdquo; to populate all official award categories.
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
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]"
                                : "bg-white/10 text-white/50 text-[10px]"
                            }
                          >
                            {c.is_active ? "Active" : "Disabled"}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <Link
                            href={`/vote/${c.slug}`}
                            target="_blank"
                            className="inline-flex items-center text-xs text-amber-400 hover:underline mr-2"
                          >
                            View
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
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            TAB 4: TICKETS & ORDERS
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "tickets" && (
          <div role="tabpanel" className="w-full space-y-4 pt-1">
            {/* Controls Bar: Search & Status Filter */}
            <div className="p-4 rounded-2xl bg-[#0d0d0d] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
              <div className="relative flex-1 max-w-md min-w-[260px]">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search order ref, name, phone or email..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white h-10 text-xs rounded-xl"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {["all", "confirmed", "pending", "failed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold uppercase font-mono transition-all shrink-0 ${
                      orderStatusFilter === st
                        ? "bg-amber-400 text-black font-bold"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Metric Strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/50 px-1">
              <span>
                Showing <strong className="text-white">{filteredOrders.length}</strong> orders
              </span>
              <span>&middot;</span>
              <span>
                <strong className="text-emerald-400">{confirmedOrders.length}</strong> confirmed
              </span>
              <span>&middot;</span>
              <span>
                Revenue: <strong className="text-amber-400">KES {grossRevenueKes.toLocaleString()}</strong>
              </span>
            </div>

            {/* Resend All QR Codes Banner */}
            {confirmedOrders.length > 0 && (
              <div className={lex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border }>
                <div>
                  <div className={	ext-sm font-bold }>
                    Send QR Ticket Emails
                  </div>
                  <div className='text-xs text-white/50 mt-0.5'>
                    Dispatch QR code passes to all {confirmedOrders.length} confirmed buyer{confirmedOrders.length !== 1 ? 's' : ''}.
                  </div>
                </div>
                <Button
                  onClick={handleResendAllTickets}
                  disabled={isResendingAll}
                  className='shrink-0 bg-amber-400 hover:bg-amber-300 text-black font-bold h-9 px-4 text-xs rounded-xl'
                >
                  {isResendingAll ? (
                    <>
                      <Loader2 className='w-3.5 h-3.5 mr-1.5 animate-spin' />
                      Sending All...
                    </>
                  ) : (
                    <>
                      <Send className='w-3.5 h-3.5 mr-1.5' />
                      Resend QR to All Buyers
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Orders Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d0d0d] overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-mono min-w-[800px]">
                <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Order Ref</th>
                    <th className="p-3.5">Buyer</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Tier</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-white/40 font-sans">
                        {ordersList.length === 0
                          ? "No ticket purchases yet. Orders will appear here when customers complete checkout."
                          : "No orders match the current filter."}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.02]">
                        <td className="p-3.5 font-bold text-white">{o.order_number}</td>
                        <td className="p-3.5 text-white font-sans">{o.buyer_name}</td>
                        <td className="p-3.5 text-white/50 text-[11px]">
                          <div>{o.buyer_phone || "â€”"}</div>
                          <div className="text-white/30 truncate max-w-[140px]">{o.buyer_email}</div>
                        </td>
                        <td className="p-3.5 text-white/70">
                          {(o as any).ticket_tiers?.name || "Regular"}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-amber-400">
                            KES {Number(o.total_amount_kes).toLocaleString()}
                          </span>
                          <span className="text-white/40 ml-1 text-[11px]">
                            ({o.quantity}x)
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
                          {o.created_at ? format(new Date(o.created_at), "d MMM, h:mm a") : "â€”"}
                        </td>
                        <td className="p-3.5 text-right">
                          {o.status === "pending" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSyncPaystackOrder(o.order_number)}
                              disabled={syncingOrderId === o.order_number}
                              className="h-8 px-2.5 text-[11px] font-sans border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                            >
                              {syncingOrderId === o.order_number ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Checking...
                                </>
                              ) : (
                                "Verify Paystack"
                              )}
                            </Button>
                          ) : (
                            <div className='flex flex-col items-end gap-1.5'>
                              <span className='text-emerald-400 text-[11px] font-sans inline-flex items-center gap-1'>
                                <Check className='w-3.5 h-3.5' />
                                Confirmed
                              </span>
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => handleResendOrderTickets(o.order_number)}
                                disabled={resendingOrderId === o.order_number}
                                className='h-7 px-2 text-[10px] font-sans text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 border border-amber-400/20'
                              >
                                {resendingOrderId === o.order_number ? (
                                  <>
                                    <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Mail className='w-3 h-3 mr-1' />
                                    Resend QR
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            TAB 5: ANTI-ABUSE & IP SECURITY
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "security" && (
          <div role="tabpanel" className="w-full space-y-4 pt-1">
            <div className="p-5 sm:p-8 rounded-2xl bg-[#0d0d0d] border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Salted IP Cluster Monitoring & Fraud Protection
                  </h2>
                  <p className="text-xs text-white/50">
                    Kenyan carrier networks use shared Carrier-Grade NAT â€” IPs are hashed.
                  </p>
                </div>
              </div>

              <p className="text-xs text-white/50 leading-relaxed max-w-3xl">
                Voter IPs are salted and hashed with a secret key before logging to ensure privacy.
                Instead of blindly blocking IP clusters (which would unfairly block thousands of legitimate
                mobile voters), anomalous voting velocity is flagged here for manual audit.
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
                          {c.voters_count} voters Â· {c.votes_count} votes
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            TAB 6: AUDIT LOG
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {activeTab === "audit" && (
          <div role="tabpanel" className="w-full space-y-4 pt-1">
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0d0d0d] overflow-x-auto w-full">
              <table className="w-full text-left text-xs font-mono min-w-[400px]">
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
                        No admin actions recorded yet. All administrative actions are automatically logged here.
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
          </div>
        )}
      </div>
    </div>
  );
}

