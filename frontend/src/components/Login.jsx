import React, { useState } from 'react';
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    VStack,
    useToast
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const toast = useToast();
    const navigate = useNavigate();

    const handleClick = () => setShow(!show);

    const handleSubmit = async () => {
        setLoading(true);

        if (!email || !password) {
            toast({
                title: 'Fill All the Fields!',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });

            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                }
            };

            const { data } = await axios.post('/api/user/login', {
                email,
                password
            }, config);

            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            navigate('/game');
        } catch (error) {
            toast({
                title: 'Filled Details are not Correct.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <VStack spacing="15px">
            <FormControl isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                    placeholder="Enter Email Address"
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>

            <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        pr='4.5rem'
                        variant="outline"
                        type={show ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Enter password'
                    />

                    <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={handleClick}>
                            {show ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button w="100%" colorScheme='blue' onClick={handleSubmit} isLoading={loading}>
                Login
            </Button>
        </VStack>
    );
}
