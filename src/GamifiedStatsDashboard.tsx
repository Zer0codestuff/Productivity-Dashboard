import React, { useRef } from "react";
import { TooltipProvider } from "./ui-compat";
import { DashboardSettingsSection } from "./features/dashboard/DashboardSettingsSection";
import {
  DashboardCharacterColumn,
  DashboardHabitsColumn,
  DashboardHeader,
  DashboardJournalSection,
  DashboardStatsColumn,
} from "./features/dashboard/DashboardSections";
import { useDashboardState } from "./features/dashboard/useDashboardState";
import { DashboardMobileNav } from "./features/dashboard/dashboard-ui";

/* ---------- Main Component ---------- */
function GamifiedStatsDashboard() {
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);
  const {
    activePage,
    addHabit,
    addStat,
    avatarSrc,
    calendarDays,
    calendarMonth,
    calendarMonthLabel,
    deleteHabit,
    deleteJournalEntry,
    energy,
    energyHistory,
    exportData,
    gainXpFromInput,
    habits,
    handleAvatarChange,
    importData,
    isEditingArc,
    isEditingPastJournalEntry,
    isLightMode,
    journalEntries,
    journalForm,
    journalStreak,
    level,
    levelUpFlash,
    mobileDashboardTab,
    motivation,
    newHabitName,
    newStatName,
    newStatVal,
    nudgeEnergy,
    nudgeRadarVal,
    openJournalEntry,
    primaryColorKey,
    profileName,
    radarStats,
    recentJournalEntries,
    removeStat,
    saveJournalEntry,
    SeasonArcIcon,
    seasonArcLabel,
    selectedHabit,
    selectedHabitCalendarDays,
    selectedHabitCompletedDates,
    selectedHabitMonthCount,
    selectedHabitMonthLabel,
    selectedJournalDate,
    selectedJournalEntry,
    setActivePage,
    setCalendarMonth,
    setHabitCalendarMonth,
    setIsEditingArc,
    setJournalForm,
    setMobileDashboardTab,
    setMotivation,
    setNewHabitName,
    setNewStatName,
    setNewStatVal,
    setPrimaryColorKey,
    setProfileName,
    setSelectedHabitId,
    setSelectedJournalDate,
    setThemeMode,
    themeMode,
    todayJournalDateKey,
    toggleHabitCompletion,
    toggleHabitDate,
    xp,
    xpInput,
    xpToNext,
    setXpInput,
  } = useDashboardState();

  /* ---------- JSX ---------- */

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <input
          ref={fileInputRef}
          id="avatar-upload-global"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <div
          className={[
            "max-w-[1680px] mx-auto px-4 py-6 md:px-6 md:py-8 xl:px-8",
            activePage === "dashboard" ? "max-lg:pb-24" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <DashboardHeader
            activePage={activePage}
            profileName={profileName}
            setActivePage={setActivePage}
          />

          {activePage === "dashboard" ? (
          <>
          <div className="flex flex-col gap-4 md:gap-6 xl:gap-8 lg:flex-row lg:flex-nowrap lg:items-stretch">
            <DashboardCharacterColumn
              avatarSrc={avatarSrc}
              energy={energy}
              fileInputRef={fileInputRef}
              level={level}
              mobileDashboardTab={mobileDashboardTab}
              newStatName={newStatName}
              newStatVal={newStatVal}
              nudgeEnergy={nudgeEnergy}
              nudgeRadarVal={nudgeRadarVal}
              primaryColorKey={primaryColorKey}
              profileName={profileName}
              radarStats={radarStats}
              removeStat={removeStat}
              setNewStatName={setNewStatName}
              setNewStatVal={setNewStatVal}
              setPrimaryColorKey={setPrimaryColorKey}
              xp={xp}
              xpToNext={xpToNext}
              addStat={addStat}
            />
            <DashboardStatsColumn
              energyHistory={energyHistory}
              isEditingArc={isEditingArc}
              isLightMode={isLightMode}
              mobileDashboardTab={mobileDashboardTab}
              motivation={motivation}
              radarStats={radarStats}
              seasonArcLabel={seasonArcLabel}
              setIsEditingArc={setIsEditingArc}
              setMotivation={setMotivation}
              SeasonArcIcon={SeasonArcIcon}
            />
            <DashboardHabitsColumn
              addHabit={addHabit}
              deleteHabit={deleteHabit}
              habits={habits}
              level={level}
              levelUpFlash={levelUpFlash}
              mobileDashboardTab={mobileDashboardTab}
              newHabitName={newHabitName}
              selectedHabit={selectedHabit}
              selectedHabitCalendarDays={selectedHabitCalendarDays}
              selectedHabitCompletedDates={selectedHabitCompletedDates}
              selectedHabitMonthCount={selectedHabitMonthCount}
              selectedHabitMonthLabel={selectedHabitMonthLabel}
              setHabitCalendarMonth={setHabitCalendarMonth}
              setNewHabitName={setNewHabitName}
              setSelectedHabitId={setSelectedHabitId}
              todayJournalDateKey={todayJournalDateKey}
              toggleHabitCompletion={toggleHabitCompletion}
              toggleHabitDate={toggleHabitDate}
              xp={xp}
              xpInput={xpInput}
              xpToNext={xpToNext}
              setXpInput={setXpInput}
              gainXpFromInput={gainXpFromInput}
            />
          </div>
          <DashboardJournalSection
            calendarDays={calendarDays}
            calendarMonth={calendarMonth}
            calendarMonthLabel={calendarMonthLabel}
            journalEntries={journalEntries}
            journalForm={journalForm}
            journalStreak={journalStreak}
            mobileDashboardTab={mobileDashboardTab}
            openJournalEntry={openJournalEntry}
            recentJournalEntries={recentJournalEntries}
            saveJournalEntry={saveJournalEntry}
            selectedJournalDate={selectedJournalDate}
            selectedJournalEntry={selectedJournalEntry}
            setCalendarMonth={setCalendarMonth}
            setJournalForm={setJournalForm}
            setSelectedJournalDate={setSelectedJournalDate}
            todayJournalDateKey={todayJournalDateKey}
            isEditingPastJournalEntry={isEditingPastJournalEntry}
            deleteJournalEntry={deleteJournalEntry}
          />
          </>
          ) : (
          <DashboardSettingsSection
            avatarSrc={avatarSrc}
            profileName={profileName}
            themeMode={themeMode}
            primaryColorKey={primaryColorKey}
            habitsCount={habits.length}
            fileInputRef={fileInputRef}
            importInputRef={importInputRef}
            setProfileName={setProfileName}
            setThemeMode={setThemeMode}
            setPrimaryColorKey={setPrimaryColorKey}
            exportData={exportData}
            importData={importData}
          />
          )}
        </div>

        {/* Mobile dashboard tab bar — only below lg; desktop shows full layout */}
        {activePage === "dashboard" ? (
          <DashboardMobileNav
            activeTab={mobileDashboardTab}
            onTabChange={setMobileDashboardTab}
          />
        ) : null}
      </div>
    </TooltipProvider>
  );
}

export default GamifiedStatsDashboard;
