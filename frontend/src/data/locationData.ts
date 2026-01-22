// Indonesia Location Data - Cascading Dropdowns
// Focus on Jawa Barat especially Kuningan

export interface Village {
    name: string;
    postalCode: string;
}

export interface District {
    name: string;
    villages: Village[];
}

export interface City {
    name: string;
    districts: District[];
}

export interface Province {
    name: string;
    cities: City[];
}

export const indonesiaLocations: Province[] = [
    {
        name: "Jawa Barat",
        cities: [
            {
                name: "Kabupaten Kuningan",
                districts: [
                    {
                        name: "Ciawigebang",
                        villages: [
                            { name: "Sidaraja", postalCode: "45591" },
                            { name: "Ciawigebang", postalCode: "45591" },
                            { name: "Ciawilor", postalCode: "45591" },
                            { name: "Cidahu", postalCode: "45591" },
                            { name: "Ciomas", postalCode: "45591" },
                            { name: "Geresik", postalCode: "45591" },
                            { name: "Karangkamulyan", postalCode: "45591" },
                            { name: "Lebaksiuh", postalCode: "45591" },
                            { name: "Pajawanlor", postalCode: "45591" },
                            { name: "Sukadana", postalCode: "45591" },
                        ]
                    },
                    {
                        name: "Kuningan",
                        villages: [
                            { name: "Kuningan", postalCode: "45511" },
                            { name: "Ancaran", postalCode: "45511" },
                            { name: "Awirarangan", postalCode: "45511" },
                            { name: "Ciporang", postalCode: "45511" },
                            { name: "Kedungarum", postalCode: "45511" },
                            { name: "Purwawinangun", postalCode: "45511" },
                            { name: "Windujanten", postalCode: "45511" },
                            { name: "Windusengkahan", postalCode: "45511" },
                        ]
                    },
                    {
                        name: "Cigugur",
                        villages: [
                            { name: "Cigugur", postalCode: "45552" },
                            { name: "Babakanmulya", postalCode: "45552" },
                            { name: "Cipari", postalCode: "45552" },
                            { name: "Cisantana", postalCode: "45552" },
                            { name: "Gunungkeling", postalCode: "45552" },
                            { name: "Puncak", postalCode: "45552" },
                            { name: "Sukamulya", postalCode: "45552" },
                        ]
                    },
                    {
                        name: "Jalaksana",
                        villages: [
                            { name: "Jalaksana", postalCode: "45554" },
                            { name: "Ciniru", postalCode: "45554" },
                            { name: "Maniskidul", postalCode: "45554" },
                            { name: "Sagarahiang", postalCode: "45554" },
                            { name: "Sangkanmulya", postalCode: "45554" },
                        ]
                    },
                    {
                        name: "Cilimus",
                        villages: [
                            { name: "Cilimus", postalCode: "45556" },
                            { name: "Bandorasa Kulon", postalCode: "45556" },
                            { name: "Bandorasa Wetan", postalCode: "45556" },
                            { name: "Caracas", postalCode: "45556" },
                            { name: "Cibeureum", postalCode: "45556" },
                            { name: "Linggajati", postalCode: "45556" },
                        ]
                    },
                    {
                        name: "Garawangi",
                        villages: [
                            { name: "Garawangi", postalCode: "45571" },
                            { name: "Cikulak", postalCode: "45571" },
                            { name: "Dukuhdalem", postalCode: "45571" },
                            { name: "Kutawaringin", postalCode: "45571" },
                            { name: "Sindangagung", postalCode: "45571" },
                        ]
                    },
                    {
                        name: "Luragung",
                        villages: [
                            { name: "Luragung", postalCode: "45581" },
                            { name: "Cikaso", postalCode: "45581" },
                            { name: "Cimara", postalCode: "45581" },
                            { name: "Luragunglandeuh", postalCode: "45581" },
                            { name: "Sindangjawa", postalCode: "45581" },
                        ]
                    },
                    {
                        name: "Kadugede",
                        villages: [
                            { name: "Kadugede", postalCode: "45561" },
                            { name: "Cipondok", postalCode: "45561" },
                            { name: "Jatimulya", postalCode: "45561" },
                            { name: "Margamukti", postalCode: "45561" },
                        ]
                    },
                    {
                        name: "Darma",
                        villages: [
                            { name: "Darma", postalCode: "45562" },
                            { name: "Cipasung", postalCode: "45562" },
                            { name: "Jagara", postalCode: "45562" },
                            { name: "Karangsari", postalCode: "45562" },
                            { name: "Sagaranten", postalCode: "45562" },
                        ]
                    },
                    {
                        name: "Lebakwangi",
                        villages: [
                            { name: "Lebakwangi", postalCode: "45573" },
                            { name: "Cikeusal", postalCode: "45573" },
                            { name: "Kaduagung", postalCode: "45573" },
                            { name: "Sindangpanji", postalCode: "45573" },
                        ]
                    }
                ]
            },
            {
                name: "Kota Bandung",
                districts: [
                    {
                        name: "Coblong",
                        villages: [
                            { name: "Dago", postalCode: "40135" },
                            { name: "Lebak Siliwangi", postalCode: "40132" },
                            { name: "Lebak Gede", postalCode: "40132" },
                            { name: "Cipaganti", postalCode: "40131" },
                            { name: "Sekeloa", postalCode: "40134" },
                            { name: "Sadang Serang", postalCode: "40133" },
                        ]
                    },
                    {
                        name: "Bandung Wetan",
                        villages: [
                            { name: "Citarum", postalCode: "40115" },
                            { name: "Cihapit", postalCode: "40114" },
                            { name: "Tamansari", postalCode: "40116" },
                        ]
                    },
                    {
                        name: "Cicendo",
                        villages: [
                            { name: "Arjuna", postalCode: "40172" },
                            { name: "Husein Sastranegara", postalCode: "40174" },
                            { name: "Pajajaran", postalCode: "40171" },
                            { name: "Pasirkaliki", postalCode: "40173" },
                            { name: "Sukaraja", postalCode: "40175" },
                        ]
                    }
                ]
            },
            {
                name: "Kabupaten Cirebon",
                districts: [
                    {
                        name: "Sumber",
                        villages: [
                            { name: "Sumber", postalCode: "45611" },
                            { name: "Kaliwadas", postalCode: "45611" },
                            { name: "Kenanga", postalCode: "45611" },
                            { name: "Sendang", postalCode: "45611" },
                        ]
                    },
                    {
                        name: "Weru",
                        villages: [
                            { name: "Weru Kidul", postalCode: "45154" },
                            { name: "Weru Lor", postalCode: "45154" },
                            { name: "Karangmulya", postalCode: "45154" },
                        ]
                    }
                ]
            },
            {
                name: "Kota Cirebon",
                districts: [
                    {
                        name: "Kesambi",
                        villages: [
                            { name: "Kesambi", postalCode: "45134" },
                            { name: "Sunyaragi", postalCode: "45132" },
                            { name: "Karyamulya", postalCode: "45135" },
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Jawa Tengah",
        cities: [
            {
                name: "Kota Semarang",
                districts: [
                    {
                        name: "Semarang Tengah",
                        villages: [
                            { name: "Pekunden", postalCode: "50134" },
                            { name: "Kauman", postalCode: "50138" },
                            { name: "Kranggan", postalCode: "50136" },
                            { name: "Gabahan", postalCode: "50133" },
                        ]
                    },
                    {
                        name: "Semarang Barat",
                        villages: [
                            { name: "Krobokan", postalCode: "50178" },
                            { name: "Tawangmas", postalCode: "50144" },
                            { name: "Cabean", postalCode: "50149" },
                        ]
                    }
                ]
            },
            {
                name: "Kota Solo",
                districts: [
                    {
                        name: "Laweyan",
                        villages: [
                            { name: "Laweyan", postalCode: "57148" },
                            { name: "Sondakan", postalCode: "57147" },
                            { name: "Pajang", postalCode: "57146" },
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Jawa Timur",
        cities: [
            {
                name: "Kota Surabaya",
                districts: [
                    {
                        name: "Gubeng",
                        villages: [
                            { name: "Airlangga", postalCode: "60286" },
                            { name: "Baratajaya", postalCode: "60284" },
                            { name: "Gubeng", postalCode: "60281" },
                            { name: "Kertajaya", postalCode: "60282" },
                            { name: "Mojo", postalCode: "60285" },
                        ]
                    },
                    {
                        name: "Wonokromo",
                        villages: [
                            { name: "Darmo", postalCode: "60264" },
                            { name: "Jagir", postalCode: "60244" },
                            { name: "Ngagel", postalCode: "60246" },
                            { name: "Wonokromo", postalCode: "60243" },
                        ]
                    }
                ]
            },
            {
                name: "Kota Malang",
                districts: [
                    {
                        name: "Klojen",
                        villages: [
                            { name: "Klojen", postalCode: "65111" },
                            { name: "Oro-oro Dowo", postalCode: "65112" },
                            { name: "Rampal Celaket", postalCode: "65111" },
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "DKI Jakarta",
        cities: [
            {
                name: "Jakarta Pusat",
                districts: [
                    {
                        name: "Menteng",
                        villages: [
                            { name: "Menteng", postalCode: "10310" },
                            { name: "Cikini", postalCode: "10330" },
                            { name: "Gondangdia", postalCode: "10350" },
                            { name: "Kebon Sirih", postalCode: "10340" },
                            { name: "Pegangsaan", postalCode: "10320" },
                        ]
                    },
                    {
                        name: "Gambir",
                        villages: [
                            { name: "Gambir", postalCode: "10110" },
                            { name: "Cideng", postalCode: "10150" },
                            { name: "Duri Pulo", postalCode: "10140" },
                            { name: "Petojo Selatan", postalCode: "10160" },
                            { name: "Petojo Utara", postalCode: "10130" },
                        ]
                    }
                ]
            },
            {
                name: "Jakarta Selatan",
                districts: [
                    {
                        name: "Kebayoran Baru",
                        villages: [
                            { name: "Senayan", postalCode: "12190" },
                            { name: "Selong", postalCode: "12110" },
                            { name: "Gunung", postalCode: "12120" },
                            { name: "Kramat Pela", postalCode: "12130" },
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "Banten",
        cities: [
            {
                name: "Kota Tangerang",
                districts: [
                    {
                        name: "Tangerang",
                        villages: [
                            { name: "Sukarasa", postalCode: "15111" },
                            { name: "Sukasari", postalCode: "15118" },
                            { name: "Tanah Tinggi", postalCode: "15119" },
                        ]
                    }
                ]
            },
            {
                name: "Kota Tangerang Selatan",
                districts: [
                    {
                        name: "Serpong",
                        villages: [
                            { name: "Serpong", postalCode: "15310" },
                            { name: "Cilenggang", postalCode: "15310" },
                            { name: "Rawa Mekar Jaya", postalCode: "15310" },
                        ]
                    },
                    {
                        name: "BSD",
                        villages: [
                            { name: "Lengkong Gudang", postalCode: "15321" },
                            { name: "Lengkong Gudang Timur", postalCode: "15321" },
                            { name: "Rawa Buntu", postalCode: "15318" },
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "DI Yogyakarta",
        cities: [
            {
                name: "Kota Yogyakarta",
                districts: [
                    {
                        name: "Gondokusuman",
                        villages: [
                            { name: "Baciro", postalCode: "55225" },
                            { name: "Demangan", postalCode: "55221" },
                            { name: "Kotabaru", postalCode: "55224" },
                            { name: "Klitren", postalCode: "55222" },
                        ]
                    }
                ]
            },
            {
                name: "Kabupaten Sleman",
                districts: [
                    {
                        name: "Depok",
                        villages: [
                            { name: "Caturtunggal", postalCode: "55281" },
                            { name: "Condongcatur", postalCode: "55283" },
                            { name: "Maguwoharjo", postalCode: "55282" },
                        ]
                    }
                ]
            }
        ]
    }
];

// Helper functions
export const getProvinces = (): string[] => {
    return indonesiaLocations.map(p => p.name);
};

export const getCities = (provinceName: string): string[] => {
    const province = indonesiaLocations.find(p => p.name === provinceName);
    return province ? province.cities.map(c => c.name) : [];
};

export const getDistricts = (provinceName: string, cityName: string): string[] => {
    const province = indonesiaLocations.find(p => p.name === provinceName);
    if (!province) return [];
    const city = province.cities.find(c => c.name === cityName);
    return city ? city.districts.map(d => d.name) : [];
};

export const getVillages = (provinceName: string, cityName: string, districtName: string): Village[] => {
    const province = indonesiaLocations.find(p => p.name === provinceName);
    if (!province) return [];
    const city = province.cities.find(c => c.name === cityName);
    if (!city) return [];
    const district = city.districts.find(d => d.name === districtName);
    return district ? district.villages : [];
};

export const getPostalCode = (provinceName: string, cityName: string, districtName: string, villageName: string): string => {
    const villages = getVillages(provinceName, cityName, districtName);
    const village = villages.find(v => v.name === villageName);
    return village ? village.postalCode : '';
};
