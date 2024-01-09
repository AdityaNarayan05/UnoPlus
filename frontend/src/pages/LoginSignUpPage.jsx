import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import SignUp from '../components/SignUp';

export default function LoginSignUp() {
    const navigate = useNavigate();

    useEffect(() => {
        let user = JSON.parse(localStorage.getItem('userInfo'));
        if (user) {
            navigate('/');
        }
    }, [navigate]);

    return (
        <Box
            display="flex"
            flexDir="column"
            alignItems="center"
            mt="80px"
        >
            <Box
                width={{ base: "100%", sm: "450px" }}
                border={{ base: "none", sm: "1px solid #E2E8F0" }}
                borderRadius="lg"
                mb="20px"
            >
                <Text
                    p="15px"
                    fontWeight="400"
                    fontSize="22px"
                >UNO+</Text>
            </Box>
            <Box
                width={{ base: "100%", sm: "450px" }}
                border={{ base: "none", sm: "1px solid #E2E8F0" }}
                borderRadius="lg"
                pt="10px"
            >
                <Tabs variant='soft-rounded' isFitted>
                    <TabList p="10px">
                        <Tab w="100%">Login</Tab>
                        <Tab w="100%">Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <SignUp />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Box>
    );
}
