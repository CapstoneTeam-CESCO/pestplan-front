import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import * as Constants from 'src/constants/Constants';
import { getItemValues, getFilterLabel } from 'src/utilities/FilterUtility';

export const usePacketCount = (filters, setPage) => {
    const [packetCount, setPacketCount] = useState(0);
    const history = useHistory();

    useEffect(() => {
        async function getPacketCount() {
            const accessToken = window.sessionStorage.getItem('access_token');

            if (!accessToken) {
                console.log(
                    'There has no access_token. Go back to the login page.'
                );

                history.push(Constants.LOGIN_PATH);
            }

            try {
                const { dates, regions, locations, models, types } = filters;

                const {
                    data: { count },
                } = await axios.get(
                    `${process.env.REACT_APP_SERVER_URL}${Constants.PACKETS_PATH}/count`,
                    {
                        params: {
                            access_token: accessToken,
                            start: dates[0].startDate,
                            end: dates[0].endDate,
                            regions: getItemValues(regions),
                            locations: getItemValues(locations),
                            models: getItemValues(models),
                            types: getItemValues(types),
                        },
                    }
                );

                setPacketCount(count);
                setPage(1);
            } catch (exception) {
                console.log(
                    'Token has an exception while get informations. Re-login please.'
                );

                history.push(Constants.LOGIN_PATH);
            }
        }

        getPacketCount();
    }, [filters]);

    return packetCount;
};

const labelPacketType = type => {
    if (type === '5') return Constants.CYCLE_LABEL;
    if (type === '4') return Constants.WARNING_LABEL;
    return Constants.ERROR_LABEL;
};

const formatCreatedAt = createdAt => {
    const year = createdAt.slice(0, 2);
    const month = createdAt.slice(2, 4);
    const day = createdAt.slice(4, 6);
    const hour = createdAt.slice(6, 8);
    const minute = createdAt.slice(8, 10);
    return `20${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
};

export const usePacketList = (page, filters, dispatchNotRead) => {
    const [packetList, setPacketList] = useState([]);
    const [packetInfo, setPacketInfo] = useState([]);
    const history = useHistory();

    useEffect(() => {
        async function getPacketList() {
            const accessToken = window.sessionStorage.getItem('access_token');

            if (!accessToken) {
                console.log(
                    'There has no access_token. Go back to the login page.'
                );

                history.push(Constants.LOGIN_PATH);
            }

            try {
                const { dates, regions, locations, models, types } = filters;

                const {
                    data: {
                        info: { today, cycle, capture, error },
                        list,
                    },
                } = await axios.get(
                    `${process.env.REACT_APP_SERVER_URL}${Constants.PACKETS_PATH}`,
                    {
                        params: {
                            access_token: accessToken,
                            page,
                            row: Constants.ROW,
                            start: dates[0].startDate,
                            end: dates[0].endDate,
                            regions: getItemValues(regions),
                            locations: getItemValues(locations),
                            models: getItemValues(models),
                            types: getItemValues(types),
                        },
                    }
                );

                const newPacketList = list.map((packet, index) => ({
                    no: (page - 1) * Constants.ROW + index + 1,
                    createdAt: formatCreatedAt(packet.created_at),
                    region: packet.region,
                    location: packet.location,
                    modelName: packet.model_name,
                    type: labelPacketType(packet.type),
                    packetId: packet.packet_id,
                    packet: JSON.stringify(packet.packet, null, 4),
                }));
                setPacketList(newPacketList);

                dispatchNotRead({
                    type: 'initialize',
                    value: {
                        list: list
                            .filter(packet => !packet.is_read)
                            .map(packet => packet.packet_id),
                    },
                });

                setPacketInfo([today, cycle, capture, error]);
            } catch (exception) {
                console.log(
                    'Token has an exception while get informations. Re-login please.'
                );

                history.push(Constants.LOGIN_PATH);
            }
        }

        getPacketList();
    }, [page, filters]);

    return { packetInfo, packetList };
};

export function useSelectedFilters(filters) {
    const [selectedFilters, setSelectedFilters] = useState([]);

    useEffect(() => {
        const selected = [];

        Object.entries(filters)
            .filter(entry => entry[0] !== 'dates' && entry[0] !== 'ranges')
            .forEach(entry =>
                entry[1]
                    .filter(filter => filter.selected)
                    .forEach(filter => {
                        if (filter.value)
                            selected.push({
                                type: entry[0],
                                id: filter.id,
                                label: `${getFilterLabel(entry[0])}: ${
                                    filter.value
                                }`,
                            });
                    })
            );

        setSelectedFilters(selected);
    }, [filters]);

    return selectedFilters;
}

export const filtersReducer = (state, action) => {
    switch (action.type) {
        case 'ranges':
        case 'dates':
            return { ...state, [action.type]: action.value };

        case 'regions':
        case 'locations':
        case 'models':
        case 'types': {
            const newState = state[action.type].map(iterator =>
                iterator.id === action.value
                    ? { ...iterator, selected: !iterator.selected }
                    : iterator
            );
            return { ...state, [action.type]: newState };
        }

        case 'model-category': {
            const newSelected = state.models
                .filter(iterator => iterator.id === action.value)
                .map(iterator => !iterator.selected)[0];
            const newState = state.models.map(iterator =>
                iterator.id === action.value ||
                iterator.id.charAt(0) === action.value.charAt(1)
                    ? { ...iterator, selected: newSelected }
                    : iterator
            );
            return { ...state, models: newState };
        }

        default:
            throw new Error(`unexpected action type: ${action.type}`);
    }
};

export const notReadReducer = (state, action) => {
    switch (action.type) {
        case 'initialize':
            return action.value;
        case 'click': {
            const updateReadStatus = async () => {
                try {
                    await axios.patch(
                        `${process.env.REACT_APP_SERVER_URL}${Constants.PACKETS_PATH}/${action.value}`
                    );
                } catch (exception) {
                    throw new Error(exception);
                }
            };
            updateReadStatus();

            const { list } = state;
            const index = list.indexOf(action.value);
            return {
                list: [...list.slice(0, index), ...list.slice(index + 1)],
            };
        }
        default:
            throw new Error(`unexpected action type: ${action.type}`);
    }
};
