import { useMemo, useState } from 'react';
import './styles/maintenance-page.css';
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

    function renderMaintenanceForm() {
        return (
            <form className="maintenance-form" onSubmit={maintenance.handleMaintenanceSubmit}>
                <label>
                    <span>Équipement</span>
                    <select
                        value={maintenance.selectedEquipmentId ?? ''}
                        onChange={(event) => maintenance.setSelectedEquipmentId(Number(event.target.value))}
                        disabled={maintenance.isEditingMaintenance}
                        required
                    >
                        {equipment.equipmentList.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name} - {item.serialNumber}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    <span>Date</span>
                    <input
                        type="date"
                        name="date"
                        value={maintenance.maintenanceFormData.date}
                        onChange={maintenance.handleMaintenanceFieldChange}
                        required
                    />
                </label>
                <label>
                    <span>Type de maintenance</span>
                    <select
                        name="interventionType"
                        value={maintenance.maintenanceFormData.interventionType}
                        onChange={maintenance.handleMaintenanceFieldChange}
                        required
                    >
                        <option value="Préventive">Préventive</option>
                        <option value="Corrective">Corrective</option>
                    </select>
                </label>
                <label>
                    <span>Statut</span>
                    <select
                        name="interventionStatus"
                        value={maintenance.maintenanceFormData.interventionStatus}
                        onChange={maintenance.handleMaintenanceFieldChange}
                        required
                    >
                        <option value="Planifiée">Planifiée</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminée">Terminée</option>
                    </select>
                </label>
                <label>
                    <span>Description</span>
                    <input
                        name="description"
                        value={maintenance.maintenanceFormData.description}
                        onChange={maintenance.handleMaintenanceFieldChange}
                        required
                    />
                </label>
                <label>
                    <span>Effectuée par</span>
                    <input
                        name="performedBy"
                        value={maintenance.maintenanceFormData.performedBy}
                        onChange={maintenance.handleMaintenanceFieldChange}
                        required
                    />
                </label>
                <label>
                    <span>Durée d'immobilisation (h)</span>
                    <input
                        type="number"
                        name="downtimeHours"
                        value={maintenance.maintenanceFormData.downtimeHours}
                        onChange={maintenance.handleMaintenanceFieldChange}
                        step="0.5"
                        min="0"
                        required
                    />
                </label>
                <label>
                    <span>Coût (€)</span>
                    <input
                        type="number"
                        name="cost"
                        value={maintenance.maintenanceFormData.cost}
                        onChange={maintenance.handleMaintenanceFieldChange}
                        step="0.01"
                        min="0"
                        required
                    />
                </label>
                <label className="maintenance-notes-field">
                    <span>Notes intervention</span>
                    <textarea
                        name="notes"
                        value={maintenance.maintenanceFormData.notes}
                        onChange={maintenance.handleMaintenanceFieldChange}
                        rows={3}
                    />
                </label>

                <div className="form-actions">
                    <button type="submit" className="btn-primary">
                        {maintenance.isEditingMaintenance ? 'Enregistrer les modifications' : 'Ajouter'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={maintenance.closeFormOnly}>
                        Annuler
                    </button>
                </div>
            </form>
        );
    }

    function renderMaintenanceModal() {
        if (!maintenance.isMaintenanceFormOpen) {
            return null;
        }

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>{maintenance.isEditingMaintenance ? 'Modifier une maintenance' : 'Ajouter une maintenance'}</h3>
                        <button type="button" className="btn-secondary" onClick={maintenance.closeFormOnly}>
                            Fermer
                        </button>
                    </div>
                    {renderMaintenanceForm()}
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
                                    onClick={() => maintenance.openEditMaintenanceForm(record)}
                                    title="Cliquer pour modifier"
                                >
                                    <td>{formatDate(record.date)}</td>
                                    <td>{getEquipmentNameById(record.equipmentId)}</td>
                                    <td>{record.interventionType}</td>
                                    <td>{record.interventionStatus}</td>
                                    <td>{record.description}</td>
                                    <td>{record.performedBy}</td>
                                    <td>{record.downtimeHours.toFixed(1)} h</td>
                                    <td className="nowrap">{record.cost.toFixed(2)} €</td>
                                    <td>{record.notes || '-'}</td>
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
