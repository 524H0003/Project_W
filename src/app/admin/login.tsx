import {
	Box,
	BoxProps,
	Button,
	FormGroup,
	H2,
	Illustration,
	Input,
	Label,
	Link,
	LinkProps,
	MessageBox,
	Text,
} from '@adminjs/design-system';
import { styled } from '@adminjs/design-system/styled-components';
import { useTranslation } from 'adminjs';

import React, { useEffect, useState } from 'react';

let email: string;

const csrfUrl = '../api/v1/csrf-token',
	Wrapper = styled(Box)<BoxProps>`
		align-items: center;
		justify-content: center;
		flex-direction: column;
		height: 100%;
	`,
	StyledLogo = styled.img`
		max-width: 200px;
		margin: ${({ theme }) => theme.space.md} 0;
	`,
	IllustrationsWrapper = styled(Box)<BoxProps>`
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		& svg [stroke='#3B3552'] {
			stroke: rgba(255, 255, 255, 0.5);
		}
		& svg [fill='#3040D6'] {
			fill: rgba(255, 255, 255, 1);
		}
	`,
	ButtonWrapper = styled(Box)<BoxProps>`
		display: flex;
		justify-content: space-between;
		align-content: center;
	`,
	StyledLink = styled(Link)<LinkProps>`
		display: flex;
		height: 100%;
		align-items: center;
	`,
	TextNoTopMargin = styled(Text)<BoxProps>`
		margin-top: 0;
	`,
	getCsrfToken = async () =>
		(await (await fetch(csrfUrl, { method: 'GET' })).json()).token,
	handleRequest = async () => {
		return fetch('../api/v1/request-signature', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'csrf-token': await getCsrfToken(),
			},
			body: JSON.stringify({ email }),
		});
	};

export type LoginProps = {
	message?: string;
	action: string;
};

export const Login: React.FC = () => {
	const props = (window as any).__APP_STATE__,
		{ action, errorMessage: message } = props,
		{ translateComponent, translateMessage } = useTranslation(),
		[token, setToken] = useState(null);

	useEffect(() => {
		async function getToken() {
			setToken(await getCsrfToken());
		}
		getToken();
	}, []);

	return (
		<Wrapper flex variant="grey" className="login__Wrapper">
			<Box
				bg="white"
				height="440px"
				flex
				boxShadow="login"
				width={[1, 2 / 3, 'auto']}
			>
				<Box
					bg="primary100"
					color="white"
					p="x3"
					width="380px"
					flexGrow={0}
					display={['none', 'none', 'block']}
					position="relative"
				>
					<H2 fontWeight="lighter">
						{translateComponent('Login.welcomeHeader')}
					</H2>
					<Text fontWeight="lighter" mt="default">
						{translateComponent('Login.welcomeMessage')}
					</Text>
					<IllustrationsWrapper p="xxl">
						<Box display="inline" mr="default">
							<Illustration variant="Planet" width={82} height={91} />
						</Box>
						<Box display="inline">
							<Illustration variant="Astronaut" width={82} height={91} />
						</Box>
						<Box display="inline" position="relative" top="-20px">
							<Illustration variant="FlagInCog" width={82} height={91} />
						</Box>
					</IllustrationsWrapper>
				</Box>
				<Box
					as="form"
					action={action}
					method="POST"
					p="x3"
					flexGrow={1}
					width={['100%', '100%', '480px']}
				>
					{message && (
						<MessageBox
							my="lg"
							message={
								message.split(' ').length > 1
									? message
									: translateMessage(message)
							}
							variant="danger"
						/>
					)}
					<Input name="_csrf" type="hidden" value={token} />
					<FormGroup>
						<Label required>
							{translateComponent('Login.properties.email')}
						</Label>
						<Input
							name="email"
							onChange={(evt) => (email = evt.target.value)}
							placeholder={translateComponent('Login.properties.email')}
						/>
					</FormGroup>
					<FormGroup>
						<Label required>
							{translateComponent('Login.properties.password')}
						</Label>
						<Input
							type="password"
							name="password"
							placeholder={translateComponent('Login.properties.password')}
							autoComplete="new-password"
						/>
					</FormGroup>
					<ButtonWrapper>
						<TextNoTopMargin mt="xl" textAlign="center">
							<StyledLink variant="contained" onClick={handleRequest}>
								{'Request password'}
							</StyledLink>
						</TextNoTopMargin>
						<TextNoTopMargin mt="xl" textAlign="center">
							<Button variant="contained" type="submit">
								{translateComponent('Login.loginButton')}
							</Button>
						</TextNoTopMargin>
					</ButtonWrapper>
				</Box>
			</Box>
		</Wrapper>
	);
};

export default Login;
