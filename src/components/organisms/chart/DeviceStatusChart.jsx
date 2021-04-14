import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import * as Constants from 'src/constants/Constants';

function DeviceStatusChart() {
    const history = useHistory();
    const [series, setSeries] = useState([]);
    const [options, setOptions] = useState({
        noData: {
            text: 'Loading...',
        },
    });

    useEffect(() => {
        async function getDeviceStatus() {
            const accessToken = window.sessionStorage.getItem('access_token');

            if (!accessToken) {
                console.log(
                    'There has no access_token. Go back to the login page.'
                );

                history.push(Constants.LOGIN_PATH);
            }

            try {
                const {
                    data: { normal, replacement, error },
                } = await axios.get(
                    `${Constants.SERVER_URL}${Constants.DASHBOARDS_PATH}/devices/status`,
                    {
                        params: {
                            access_token: accessToken,
                        },
                    }
                );

                setSeries([normal, replacement, error]);

                setOptions({
                    labels: ['normal', 'replacement', 'error'],
                    responsive: [
                        {
                            breakpoint: 480,
                            options: {
                                chart: {
                                    width: 200,
                                },
                                legend: {
                                    position: 'bottom',
                                },
                            },
                        },
                    ],
                });
            } catch (exception) {
                console.log(exception);
            }
        }

        getDeviceStatus();
    }, []);

    return (
        <div className="card chart--device-status">
            <ReactApexChart
                options={options}
                series={series}
                type="pie"
                height={300}
            />
        </div>
    );
}

export default DeviceStatusChart;
