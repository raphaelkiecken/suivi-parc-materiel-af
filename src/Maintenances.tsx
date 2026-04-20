import { useMemo, useState } from 'react';
import './styles/maintenance-page.css';
import MaintenanceForm from './components/MaintenanceForm';
import type { UseEquipmentReturn } from './hooks/useEquipment';
import type { UseMaintenanceReturn } from './hooks/useMaintenance';
import { formatDate } from './utils/dateUtils';

interface MaintenancesProps {
    equipment: UseEquipmentReturn;
    maintenance: UseMaintenanceReturn;
}

export default function Maintenances({ equipment, maintenance }: Readonly<MaintenancesProps>) {
    const [equipmentFilter, setEquipmentFilter] = useState('');

    const displayedMaintenance = useMemo(() => {
        const filteredRecords = maintenance.maintenanceList.filter((record) => {
            if (equipmentFilter === '') {
                return true;
            }
            return record.equipmentId === Number(equipmentFilter);
        });

        return [...filteredRecords].sort((left, right) => right.date.localeCompare(left.date));
    }, [equipmentFilter, maintenance.maintenanceList]);

    function openAddForm() {
        const defaultEquipmentId = equipmentFilter === ''
            ? equipment.equipmentList[0]?.id
            : Number(equipmentFilter);

        if (!defaultEquipmentId) {
            return;
        }

        maintenance.openAddMaintenanceForm(defaultEquipmentId);
    }

    function getEquipmentNameById(equipmentId: number) {
        const equipmentItem = equipment.equipmentList.find((item) => item.id === equipmentId);
        return equipmentItem ? `${equipmentItem.name} - ${equipmentItem.serialNumber}` : 'Équipement supprimé';
    }

    function renderMaintenanceModal() {
        if (!maintenance.isMaintenanceFormOpen) {
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

    return (
        <div className="maintenance-page">
            <div className="maintenance-header">
                <h2>Maintenances</h2>
                <button
                    type="button"
                    className="btn-primary"
                    onClick={openAddForm}
                    disabled={equipment.equipmentList.length === 0}
                >
                    Ajouter une maintenance
                </button>
            </div>

            <section className="maintenance-controls">
                <label className="control-field">
                    <span>Filtrer par équipement</span>
                    <select value={equipmentFilter} onChange={(event) => setEquipmentFilter(event.target.value)}>
                        <option value="">Tous les équipements</option>
                        {equipment.equipmentList.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name} - {item.serialNumber}
                            </option>
                        ))}
                    </select>
                </label>
            </section>

            <p className="maintenance-results-count">
                {displayedMaintenance.length} maintenance(s) affichée(s)
            </p>

            <div className="table-wrap">
                <table className="maintenance-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Équipement</th>
                            <th>Type</th>
                            <th>Statut</th>
                            <th>Description</th>
                            <th>Effectuée par</th>
                            <th>Immobilisation</th>
                            <th className="nowrap">Coût</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedMaintenance.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="maintenance-empty-table-cell">
                                    Aucune maintenance enregistrée pour ce filtre.
                                </td>
                            </tr>
                        ) : (
                            displayedMaintenance.map((record) => (
                                <tr
                                    key={record.id}
                                    className="clickable-row"
                                    onClick={() => maintenance.openReadOnlyMaintenanceForm(record)}
                                    title="Cliquer pour ouvrir la fiche"
                                >
                                    <td data-label="Date">{formatDate(record.date)}</td>
                                    <td data-label="Equipement">{getEquipmentNameById(record.equipmentId)}</td>
                                    <td data-label="Type">{record.interventionType}</td>
                                    <td data-label="Statut">{record.interventionStatus}</td>
                                    <td data-label="Description">{record.description}</td>
                                    <td data-label="Effectuee par">{record.performedBy}</td>
                                    <td data-label="Immobilisation">{record.downtimeHours.toFixed(1)} h</td>
                                    <td data-label="Cout" className="nowrap">{record.cost.toFixed(2)} €</td>
                                    <td data-label="Notes">{record.notes || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {renderMaintenanceModal()}
        </div>
    );
}
