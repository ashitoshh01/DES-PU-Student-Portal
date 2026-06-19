"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  GraduationCap,
  Building2,
} from "lucide-react";
import { DEPARTMENTS } from "@/lib/resources-mock-data";
import { useResourcesStore } from "@/store/resources.store";

export default function ResourcesExplorer() {
  const {
    expandedNodes,
    toggleNode,
    activeSemesterId,
    setActivePath,
    activeDepartmentId,
    activeYearId,
  } = useResourcesStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full"
    >
      {/* Explorer Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FolderOpen size={14} className="text-text-secondary" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Explore Resources
          </span>
        </div>
        <button
          onClick={() => toggleNode("engineering")}
          className="p-1 rounded hover:bg-background transition-colors"
        >
          {expandedNodes.has("engineering") ? (
            <ChevronDown size={14} className="text-text-secondary" />
          ) : (
            <ChevronRight size={14} className="text-text-secondary" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {expandedNodes.has("engineering") && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Root: Engineering */}
            <TreeItem
              icon={<Building2 size={13} className="text-text-secondary" />}
              label="Engineering"
              level={0}
              isExpanded={true}
              hasChildren
              nodeId="engineering"
            />

            {/* Departments */}
            {DEPARTMENTS.map((dept) => {
              const isDeptExpanded = expandedNodes.has(dept.id);
              const isDeptActive = activeDepartmentId === dept.id;

              return (
                <div key={dept.id}>
                  <TreeItem
                    icon={
                      isDeptExpanded ? (
                        <FolderOpen
                          size={13}
                          className={isDeptActive ? "text-primary" : "text-text-secondary"}
                        />
                      ) : (
                        <Folder
                          size={13}
                          className={isDeptActive ? "text-primary" : "text-text-secondary"}
                        />
                      )
                    }
                    label={dept.name}
                    level={1}
                    isExpanded={isDeptExpanded}
                    hasChildren
                    nodeId={dept.id}
                    isActive={isDeptActive}
                    onClick={() => toggleNode(dept.id)}
                  />

                  <AnimatePresence>
                    {isDeptExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        {dept.years.map((year) => {
                          const isYearExpanded = expandedNodes.has(year.id);
                          const isYearActive = activeYearId === year.id;

                          return (
                            <div key={year.id}>
                              <TreeItem
                                icon={
                                  <GraduationCap
                                    size={12}
                                    className={
                                      isYearActive
                                        ? "text-primary"
                                        : "text-text-secondary"
                                    }
                                  />
                                }
                                label={year.name}
                                level={2}
                                isExpanded={isYearExpanded}
                                hasChildren
                                nodeId={year.id}
                                isActive={isYearActive}
                                onClick={() => toggleNode(year.id)}
                              />

                              <AnimatePresence>
                                {isYearExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.12 }}
                                    className="overflow-hidden"
                                  >
                                    {year.semesters.map((sem) => {
                                      const isSemActive =
                                        activeSemesterId === sem.id;

                                      return (
                                        <TreeItem
                                          key={sem.id}
                                          label={sem.name}
                                          level={3}
                                          isExpanded={false}
                                          hasChildren={false}
                                          nodeId={sem.id}
                                          isActive={isSemActive}
                                          onClick={() =>
                                            setActivePath(
                                              dept.id,
                                              year.id,
                                              sem.id
                                            )
                                          }
                                          isSemester
                                        />
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// Tree Item
// ============================================================

function TreeItem({
  icon,
  label,
  level,
  isExpanded,
  hasChildren,
  nodeId,
  isActive,
  onClick,
  isSemester,
}: {
  icon?: React.ReactNode;
  label: string;
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
  nodeId: string;
  isActive?: boolean;
  onClick?: () => void;
  isSemester?: boolean;
}) {
  const paddingLeft = 8 + level * 16;

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 py-1.5 pr-2 rounded-lg text-[12px] font-medium transition-all duration-150 text-left group
        ${
          isActive
            ? isSemester
              ? "bg-primary-light text-primary font-semibold"
              : "text-primary font-semibold"
            : "text-text-secondary hover:bg-background hover:text-text-primary"
        }
      `}
      style={{ paddingLeft }}
    >
      {hasChildren && (
        <span className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown size={12} className={isActive ? "text-primary" : "text-text-secondary"} />
          ) : (
            <ChevronRight size={12} className="text-text-secondary" />
          )}
        </span>
      )}
      {!hasChildren && <span className="w-3" />}
      {icon}
      <span className="truncate">{label}</span>
      {isSemester && isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
      )}
    </button>
  );
}
