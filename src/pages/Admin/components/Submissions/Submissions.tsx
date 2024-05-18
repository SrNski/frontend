import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the grid
import { useState, useRef, LegacyRef, useEffect } from 'react';
import { ColDef, GridOptions } from 'ag-grid-community';
import './Submissions.css';
import UserSubmissionTableElement from '../../../../interfaces/UserSubmissionTableElement';
import Button from '../../../../components/Button/Button';
import { useTranslation } from 'react-i18next';
import submission from '../../../../services/submission';
import toast from '../../../../services/toast';
import { ToastType } from '../../../../interfaces/ToastType';
import moment from 'moment';

export default function Submissions() {
    const { t } = useTranslation(['admin', 'main']);

    // Create a gridRef
    const gridRef: LegacyRef<AgGridReact> = useRef<AgGridReact>(null);

    // Grid Options
    const gridOptions: GridOptions = {
        pagination: true,
        paginationPageSize: 8,
        paginationPageSizeSelector: [8, 25, 50, 100],
        rowHeight: 55,
        autoSizeStrategy: {
            type: 'fitGridWidth',
            defaultMinWidth: 50,
        },
    };

    // Row Data
    // TODO: Fetch Data from API
    const [rowData, setRowData] = useState<UserSubmissionTableElement[]>([]);

    useEffect(() => {
        let hasBeenExecuted  = false;
        const fetchData = async () => {
            try {
                const res = await submission.list();
                if(res.ok) {
                    const data = await res.json();
                    setRowData(parseJson(data));
                }
                else {
                    const data = await res.json();
                    toast.showToast(ToastType.ERROR, toast.httpError(res.status, data.error));
                }
            }
            catch (e: any) {
                toast.showToast(ToastType.ERROR, e.message);
            }
        };
        if (!hasBeenExecuted) {
            fetchData();
        }
        return () => {
            hasBeenExecuted = true; // Cleanup
        };
    }, []);

    function parseJson(jsonArray: any[]): UserSubmissionTableElement[] {
        return jsonArray.map(item => ({
            email: item.userEmail,
            id: item.projectID,
            link: "",
            state: item.status,
            turnInDate: moment(item.turnInDate).format("DD.MM.YYYY hh:mm") == "Invalid date" ? "No Date" : moment(item.turnInDate).format("DD.MM.YYYY hh:mm"),
            expirationDate: moment(item.expirationDate).format("DD.MM.YYYY hh:mm") == "Invalid date" ? "No Date" : moment(item.expirationDate).format("DD.MM.YYYY hh:mm"),
        }));
    }


    // Cell Renderers
    const resultButtonRenderer = (params: any) => (
        <form action={params.value} target='_blank'>
            { params.data.state == 'SUBMITTED' && <Button text={t('buttonResult', { ns: 'main'})} />}
        </form>
    );

    const stateTextRenderer = (params: any) => (
        <text>{params.value}</text>
    );

    // Column Definitions
    const [colDefs, setColDefs] = useState<ColDef<UserSubmissionTableElement>[]>([]);
    useEffect(() => {
        setColDefs([
            {
                    headerName: t('tableHeaderEmail'),
                    field: 'email',
                    cellDataType: 'text',
                    filter: true,
                    filterParams: {
                        filterOptions: [
                            'contains',
                            'notContains',
                            'startsWith',
                            'endsWith',
                        ],
                    },
                    sortable: true,
                    editable: false,
                    cellClass: 'cell-vertical-align-text-center',
                },
                {
                    headerName: t('tableHeaderResult'),
                    field: 'link',
                    filter: false,
                    sortable: true,
                    editable: false,
                    cellRenderer: resultButtonRenderer,
                    cellClass: 'cell-vertical-align-text-center',
                },
                {
                    headerName: t('tableHeaderState'),
                    field: 'state',
                    filter: true,
                    sortable: true,
                    cellRenderer: stateTextRenderer,
                    cellClass: 'cell-vertical-align-text-center',
                },
                {
                    headerName: t('tableHeaderTurnIn'),
                    field: 'turnInDate',
                    filter: false,
                    sortable: true,
                    cellClass: 'cell-vertical-align-text-center',
                },
                {
                    headerName: t('tableHeaderExpiration'),
                    field: 'expirationDate',
                    filter: false,
                    sortable: true,
                    cellClass: 'cell-vertical-align-text-center',
                },
                {
                    headerName: t('tableHeaderId'),
                    field: 'id',
                    filter: false,
                    sortable: true,
                    cellClass: 'cell-vertical-align-text-center',
                },
            ]);
    }, [t]);

    return (
        <div className="center">
            <h1>{t('submissionTitle')}</h1>
            <div
                className="ag-theme-quartz" // applying the grid theme
                style={{ height: 540, width: 1000 }}
            >
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    gridOptions={gridOptions}
                />
            </div>
        </div>
    );
}
