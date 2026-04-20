import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import EquipmentForm from './components/EquipmentForm';
import EquipmentPublicSheet from './EquipmentPublicSheet';
import MaintenanceForm from './components/MaintenanceForm';
import Equipment from './Equipment';
import Maintenances from './Maintenances';
import { useEquipment } from './hooks/useEquipment';
import { useMaintenance } from './hooks/useMaintenance';
import { formatDate } from './utils/dateUtils';
import './styles/base.css';
import './styles/common.css';
import './styles/dashboard.css';

interface DashboardProps {
    equipmentList: ReturnType<typeof useEquipment>['equipmentList'];
    maintenanceList: ReturnType<typeof useMaintenance>['maintenanceList'];
    onOpenEquipment: (equipmentId: number) => void;
}

function Dashboard({ equipmentList, maintenanceList, onOpenEquipment }: Readonly<DashboardProps>) {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${now.getFullYear()}-${month}`;
    });

    const today = useMemo(() => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        return currentDate;
    }, []);

    const expiringWarranties = useMemo(() => {
        const alertWindowDays = 60;

        return equipmentList
            .map((item) => {
                const targetDate = new Date(item.warrantyExpiration);
                targetDate.setHours(0, 0, 0, 0);
                const msDiff = targetDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

                return { item, daysDiff };
            })
            .filter(({ item, daysDiff }) => item.warrantyExpiration && daysDiff >= 0 && daysDiff <= alertWindowDays)
            .sort((left, right) => left.item.warrantyExpiration.localeCompare(right.item.warrantyExpiration));
    }, [equipmentList, today]);

    const expiredWarranties = useMemo(() => {
        return equipmentList
            .map((item) => {
                const targetDate = new Date(item.warrantyExpiration);
                targetDate.setHours(0, 0, 0, 0);
                const msDiff = targetDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

                return { item, daysDiff };
            })
            .filter(({ item, daysDiff }) => item.warrantyExpiration && daysDiff < 0)
            .sort((left, right) => right.item.warrantyExpiration.localeCompare(left.item.warrantyExpiration));
    }, [equipmentList, today]);

    const plannedMaintenances = useMemo(() => {
        return maintenanceList
            .filter((record) => record.interventionStatus === 'Planifiée')
            .sort((left, right) => left.date.localeCompare(right.date));
    }, [maintenanceList]);

    const equipmentLabelById = useMemo(() => {
        return new Map(equipmentList.map((item) => [item.id, `${item.name} - ${item.serialNumber}`]));
    }, [equipmentList]);

    const monthlyCostRows = useMemo(() => {
        const totalsByEquipment = new Map<number, { equipmentId: number; equipmentName: string; totalCost: number; interventionCount: number }>();

        for (const record of maintenanceList) {
            if (!record.date.startsWith(selectedMonth)) {
                continue;
            }

            const equipmentName = equipmentLabelById.get(record.equipmentId) ?? `Équipement #${record.equipmentId}`;
            const existingRow = totalsByEquipment.get(record.equipmentId);

            if (existingRow) {
                existingRow.totalCost += record.cost;
                existingRow.interventionCount += 1;
            } else {
                totalsByEquipment.set(record.equipmentId, {
                    equipmentId: record.equipmentId,
                    equipmentName,
                    totalCost: record.cost,
                    interventionCount: 1
                });
            }
        }

        return Array.from(totalsByEquipment.values()).sort((left, right) => right.totalCost - left.totalCost);
    }, [equipmentLabelById, maintenanceList, selectedMonth]);

    const monthlyTotal = useMemo(
        () => monthlyCostRows.reduce((total, row) => total + row.totalCost, 0),
        [monthlyCostRows]
    );

    return (
        <div className="dashboard-layout">
            <section className="dashboard-intro">
                <h1>Tableau de bord maintenance</h1>
                <p>Vision rapide des garanties et des coûts de maintenance.</p>
            </section>

            <section className="dashboard-panels">
                <article className="dashboard-panel">
                    <h3>Garanties qui expirent bientôt ({expiringWarranties.length})</h3>
                    {expiringWarranties.length === 0 ? (
                        <p className="dashboard-empty">Aucune garantie n'expire dans les 60 prochains jours.</p>
                    ) : (
                        <ul className="dashboard-list">
                            {expiringWarranties.map(({ item, daysDiff }) => (
                                <li key={item.id} className="dashboard-list-item">
                                    <button type="button" className="dashboard-product-link" onClick={() => onOpenEquipment(item.id)}>
                                        {item.name} - {item.serialNumber}
                                    </button>
                                    <span>{formatDate(item.warrantyExpiration)} ({daysDiff} jour(s))</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>

                <article className="dashboard-panel">
                    <h3>Garanties déjà expirées</h3>
                    {expiredWarranties.length === 0 ? (
                        <p className="dashboard-empty">Aucune garantie expirée.</p>
                    ) : (
                        <ul className="dashboard-list">
                            {expiredWarranties.map(({ item }) => (
                                <li key={item.id} className="dashboard-list-item">
                                    <button type="button" className="dashboard-product-link" onClick={() => onOpenEquipment(item.id)}>
                                        {item.name} - {item.serialNumber}
                                    </button>
                                    <span>{formatDate(item.warrantyExpiration)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>

                <article className="dashboard-panel">
                    <h3>Maintenances planifiées ({plannedMaintenances.length})</h3>
                    {plannedMaintenances.length === 0 ? (
                        <p className="dashboard-empty">Aucune maintenance planifiée.</p>
                    ) : (
                        <ul className="dashboard-list">
                            {plannedMaintenances.map((record) => (
                                <li key={record.id} className="dashboard-list-item">
                                    <button type="button" className="dashboard-product-link" onClick={() => onOpenEquipment(record.equipmentId)}>
                                        {equipmentLabelById.get(record.equipmentId) ?? `Équipement #${record.equipmentId}`}
                                    </button>
                                    <span>{formatDate(record.date)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>
            </section>

            <section className="equipment dashboard-costs">
                <div className="equipment-header">
                    <h2>Coûts de maintenance par mois</h2>
                </div>

                <div className="dashboard-month-filter">
                    <label className="control-field">
                        <span>Mois</span>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(event) => setSelectedMonth(event.target.value)}
                        />
                    </label>
                </div>

                <p className="equipment-results-count">Total du mois: {monthlyTotal.toFixed(2)} €</p>

                {monthlyCostRows.length === 0 ? (
                    <p className="dashboard-empty">Aucun coût de maintenance pour ce mois.</p>
                ) : (
                    <div className="table-wrap">
                        <table className="maintenance-table">
                            <thead>
                                <tr>
                                    <th>Équipement</th>
                                    <th>Interventions</th>
                                    <th className="nowrap">Coût total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyCostRows.map((row) => (
                                    <tr key={row.equipmentId}>
                                        <td>
                                            <button type="button" className="dashboard-product-link" onClick={() => onOpenEquipment(row.equipmentId)}>
                                                {row.equipmentName}
                                            </button>
                                        </td>
                                        <td>{row.interventionCount}</td>
                                        <td className="nowrap">{row.totalCost.toFixed(2)} €</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default function App() {
    const equipment = useEquipment();
    const maintenance = useMaintenance();
    const location = useLocation();
    const [isDashboardSheetMaintenanceVisible, setIsDashboardSheetMaintenanceVisible] = useState(false);
    const isPublicEquipmentSheetRoute = location.pathname.startsWith('/fiche/equipement/');

    function toggleDashboardSheetMaintenanceVisibility() {
        setIsDashboardSheetMaintenanceVisible((currentValue) => {
            if (currentValue) {
                return false;
            }
            return true;
        });
    }

    useEffect(() => {
        const isAnyModalOpen = equipment.isEquipmentFormOpen || maintenance.isMaintenanceFormOpen;

        if (isAnyModalOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [equipment.isEquipmentFormOpen, maintenance.isMaintenanceFormOpen]);

    function openEquipmentSheet(equipmentId: number) {
        const equipmentItem = equipment.equipmentList.find((item) => item.id === equipmentId);
        if (!equipmentItem) {
            return;
        }

        setIsDashboardSheetMaintenanceVisible(false);
        equipment.openReadOnlyEquipmentForm(equipmentItem);
    }

    function startMaintenanceFromEquipmentSheet(equipmentId: number) {
        equipment.closeEquipmentForm();
        maintenance.openAddMaintenanceForm(equipmentId);
    }

    function renderGlobalMaintenanceModal() {
        if (!maintenance.isMaintenanceFormOpen || location.pathname === '/maintenances') {
            return null;
        }

        let modalTitle = 'Ajouter une maintenance';
        if (maintenance.isReadOnlyMaintenanceModal) {
            modalTitle = 'Fiche maintenance';
        } else if (maintenance.isEditingMaintenance) {
            modalTitle = 'Modifier une maintenance';
        }

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>{modalTitle}</h3>
                        <div className="modal-header-actions">
                            {maintenance.isReadOnlyMaintenanceModal && (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={maintenance.enableMaintenanceEditMode}
                                >
                                    Modifier la fiche
                                </button>
                            )}
                            <button type="button" className="btn-secondary" onClick={maintenance.closeFormOnly}>
                                Fermer
                            </button>
                        </div>
                    </div>
                    <MaintenanceForm
                        maintenance={maintenance}
                        equipmentList={equipment.equipmentList}
                        onCancel={maintenance.closeFormOnly}
                    />
                </div>
            </div>
        );
    }

    function renderDashboardEquipmentSheetModal() {
        if (!equipment.isEquipmentFormOpen || location.pathname !== '/dashboard') {
            return null;
        }

        const currentEquipmentId = equipment.editingEquipmentId;
        const equipmentMaintenances = currentEquipmentId === null
            ? []
            : maintenance.maintenanceList
                .filter((record) => record.equipmentId === currentEquipmentId)
                .sort((left, right) => right.date.localeCompare(left.date));
        let historyToggleLabel = 'Afficher la liste';
        if (isDashboardSheetMaintenanceVisible) {
            historyToggleLabel = 'Masquer la liste';
        }
        let historyContent: ReactNode = null;
        if (isDashboardSheetMaintenanceVisible) {
            if (equipmentMaintenances.length === 0) {
                historyContent = <p className="equipment-sheet-maintenance-empty">Aucune maintenance enregistrée pour cet équipement.</p>;
            } else {
                historyContent = (
                    <ul className="equipment-sheet-maintenance-list">
                        {equipmentMaintenances.map((record) => (
                            <li key={record.id}>
                                <strong>{formatDate(record.date)}</strong> - {record.interventionType} ({record.interventionStatus}) - {record.description}
                            </li>
                        ))}
                    </ul>
                );
            }
        }

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>Fiche équipement</h3>
                        <div className="modal-header-actions">
                            {equipment.isReadOnlyEquipmentModal && (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={equipment.enableEquipmentEditMode}
                                >
                                    Modifier la fiche
                                </button>
                            )}
                            <button type="button" className="btn-secondary" onClick={equipment.closeEquipmentForm}>
                                Fermer
                            </button>
                        </div>
                    </div>
                    <EquipmentForm equipment={equipment} onCancel={equipment.closeEquipmentForm} />

                    <section className="equipment-sheet-maintenance">
                        <div className="equipment-sheet-maintenance-header">
                            <h4>Historique des maintenances ({equipmentMaintenances.length})</h4>
                                <div className="equipment-sheet-maintenance-actions">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={toggleDashboardSheetMaintenanceVisibility}
                                    >
                                        {historyToggleLabel}
                                    </button>
                                    {currentEquipmentId !== null && (
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            onClick={() => startMaintenanceFromEquipmentSheet(currentEquipmentId)}
                                        >
                                            Ajouter une maintenance
                                        </button>
                                    )}
                                </div>
                        </div>

                        {historyContent}
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div>
            {!isPublicEquipmentSheetRoute && (
                <div className="app-nav">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `app-nav-btn ${isActive ? 'app-nav-btn-active' : ''}`}
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/equipements"
                        className={({ isActive }) => `app-nav-btn ${isActive ? 'app-nav-btn-active' : ''}`}
                    >
                        Equipements
                    </NavLink>
                    <NavLink
                        to="/maintenances"
                        className={({ isActive }) => `app-nav-btn ${isActive ? 'app-nav-btn-active' : ''}`}
                    >
                        Maintenances
                    </NavLink>
                </div>
            )}

            <Routes>
                <Route
                    path="/fiche/equipement/:equipmentId"
                    element={
                        <EquipmentPublicSheet
                            equipmentList={equipment.equipmentList}
                            maintenanceList={maintenance.maintenanceList}
                        />
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <Dashboard
                            equipmentList={equipment.equipmentList}
                            maintenanceList={maintenance.maintenanceList}
                            onOpenEquipment={openEquipmentSheet}
                        />
                    }
                />
                <Route
                    path="/equipements"
                    element={
                        <Equipment
                            equipment={equipment}
                            maintenanceList={maintenance.maintenanceList}
                            onAddMaintenanceForEquipment={startMaintenanceFromEquipmentSheet}
                        />
                    }
                />
                <Route path="/maintenances" element={<Maintenances equipment={equipment} maintenance={maintenance} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            {!isPublicEquipmentSheetRoute && renderDashboardEquipmentSheetModal()}
            {!isPublicEquipmentSheetRoute && renderGlobalMaintenanceModal()}
        </div>
    );
}
