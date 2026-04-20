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
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [requestedPage, setRequestedPage] = useState(1);

    const displayedMaintenance = useMemo(() => {
        const filteredRecords = maintenance.maintenanceList.filter((record) => {
            if (equipmentFilter === '') {
                return true;
            }
            return record.equipmentId === Number(equipmentFilter);
        });

        return [...filteredRecords].sort((left, right) => right.date.localeCompare(left.date));
    }, [equipmentFilter, maintenance.maintenanceList]);

    const totalItems = displayedMaintenance.length;
    const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / itemsPerPage)), [itemsPerPage, totalItems]);
    const currentPage = Math.min(requestedPage, totalPages);
    const paginatedMaintenance = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return displayedMaintenance.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, displayedMaintenance, itemsPerPage]);

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
                    <select
                        value={equipmentFilter}
                        onChange={(event) => {
                            setRequestedPage(1);
                            setEquipmentFilter(event.target.value);
                        }}
                    >
                        <option value="">Tous les équipements</option>
                        {equipment.equipmentList.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name} - {item.serialNumber}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="control-field">
                    <span>Par page</span>
                    <select
                        value={itemsPerPage}
                        onChange={(event) => {
                            setRequestedPage(1);
                            setItemsPerPage(Number(event.target.value));
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </label>
            </section>

            <p className="maintenance-results-count">
                {displayedMaintenance.length} maintenance(s) affichée(s)
            </p>

            {totalItems > itemsPerPage && (
                <nav className="list-pagination" aria-label="Pagination maintenances">
                    <p className="list-pagination-meta">Page {currentPage} / {totalPages}</p>
                    <div className="list-pagination-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setRequestedPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                        >
                            Précédent
                        </button>
                        <div className="list-pagination-pages">
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    className={`btn-secondary ${pageNumber === currentPage ? 'btn-secondary-active' : ''}`}
                                    onClick={() => setRequestedPage(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setRequestedPage((page) => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Suivant
                        </button>
                    </div>
                </nav>
            )}

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
                            <th>Immobilisation (min)</th>
                            <th className="nowrap">Coût</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedMaintenance.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="maintenance-empty-table-cell">
                                    Aucune maintenance enregistrée pour ce filtre.
                                </td>
                            </tr>
                        ) : (
                            paginatedMaintenance.map((record) => (
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
                                    <td data-label="Immobilisation">{record.downtimeMinutes} min</td>
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
