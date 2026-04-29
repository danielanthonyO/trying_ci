import type { Lang } from "./LangContext";

export const t: Record<Lang, any> = {
  en: {
    dashboard: {
      title: "Work overview",
      newWorkOrder: "+ New work order",

      stats: {
        active: "Active",
        planned: "Planned",
        done: "Done",
        cancelled: "Cancelled",
        thisWeek: "This week",
        revenue: "Revenue",

        inProgressHint: "In progress",
        plannedHint: "Waiting to start",
        doneHint: "Completed jobs",
        cancelledHint: "Cancelled jobs",
        thisWeekHint: "Created in last 7 days",
        revenueHint: "Invoice totals later",
      },

      todaySchedule: "Today’s schedule",
      openCalendar: "Open calendar →",
      loading: "Loading…",
      noJobsToday: "No jobs scheduled today.",
      tipTitle: "Tip",
      tipText:
        "Click a job to open details. Use the Calendar page for full schedule.",

      latest: "Latest work orders",
      viewAll: "View all →",
      noOrders: "No work orders yet.",
    },

    status: {
      planned: "Planned",
      in_progress: "In progress",
      done: "Done",
      cancelled: "Cancelled",
      now: "● NOW",
    },

    sidebar: {
      dashboard: "Dashboard",
      workspace: "Workspace",
      calendar: "Calendar",
      workOrders: "Work Orders",
      customers: "Customers",
      invoices: "Invoices",
      parts: "Parts",
      users: "Users",
      system: "System",
      settings: "Settings",
      language: "Language",
    },
  },

  fi: {
    dashboard: {
      title: "Työn yleiskatsaus",
      newWorkOrder: "+ Uusi työmääräys",

      stats: {
        active: "Käynnissä",
        planned: "Suunniteltu",
        done: "Valmis",
        cancelled: "Peruttu",
        thisWeek: "Tällä viikolla",
        revenue: "Liikevaihto",

        inProgressHint: "Työn alla",
        plannedHint: "Odottaa aloitusta",
        doneHint: "Valmiit työt",
        cancelledHint: "Perutut työt",
        thisWeekHint: "Luotu viimeisen 7 päivän aikana",
        revenueHint: "Laskut myöhemmin",
      },

      todaySchedule: "Tämän päivän aikataulu",
      openCalendar: "Avaa kalenteri →",
      loading: "Ladataan…",
      noJobsToday: "Ei töitä tälle päivälle.",
      tipTitle: "Vinkki",
      tipText:
        "Klikkaa työtä avataksesi tiedot. Täysi aikataulu löytyy kalenterista.",

      latest: "Uusimmat työmääräykset",
      viewAll: "Näytä kaikki →",
      noOrders: "Ei työmääräyksiä vielä.",
    },

    status: {
      planned: "Suunniteltu",
      in_progress: "Työn alla",
      done: "Valmis",
      cancelled: "Peruttu",
      now: "● NYT",
    },

    sidebar: {
      dashboard: "Etusivu",
      workspace: "Työtila",
      calendar: "Kalenteri",
      workOrders: "Työmääräykset",
      customers: "Asiakkaat",
      invoices: "Laskut",
      parts: "Osat",
      users: "Käyttäjät",
      system: "Järjestelmä",
      settings: "Asetukset",
      language: "Kieli",
    },
  },
  sv: {
    dashboard: {
      title: "Arbetsöversikt",
      newWorkOrder: "+ Ny arbetsorder",

      stats: {
        active: "Aktiv",
        planned: "Planerad",
        done: "Klar",
        cancelled: "Avbruten",
        thisWeek: "Denna vecka",
        revenue: "Intäkter",

        inProgressHint: "Pågår",
        plannedHint: "Väntar på start",
        doneHint: "Avslutade jobb",
        cancelledHint: "Avbrutna jobb",
        thisWeekHint: "Skapade de senaste 7 dagarna",
        revenueHint: "Fakturasummor senare",
      },

      todaySchedule: "Dagens schema",
      openCalendar: "Öppna kalender →",
      loading: "Laddar…",
      noJobsToday: "Inga jobb schemalagda idag.",
      tipTitle: "Tips",
      tipText:
        "Klicka på ett jobb för att öppna detaljer. Använd kalendern för hela schemat.",

      latest: "Senaste arbetsorder",
      viewAll: "Visa alla →",
      noOrders: "Inga arbetsorder ännu.",
    },

    status: {
      planned: "Planerad",
      in_progress: "Pågår",
      done: "Klar",
      cancelled: "Avbruten",
      now: "● NU",
    },

    sidebar: {
      dashboard: "Instrumentpanel",
      workspace: "Arbetsyta",
      calendar: "Kalender",
      workOrders: "Arbetsorder",
      customers: "Kunder",
      invoices: "Fakturor",
      parts: "Delar",
      users: "Användare",
      system: "System",
      settings: "Inställningar",
      language: "Språk",
    },
  },
};
