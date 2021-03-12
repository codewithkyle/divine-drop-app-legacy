async function RegisterUser(email: string, password: string, name: string): Promise<FormResponse> {
	const data = {
		email: email,
		password: password,
		name: name,
	};
	const request = await apiRequest("/v1/register", "POST", data);
	const fetchResponse = await request.json();
	const response: Partial<FormResponse> = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	if (!response.Success) {
		response.FieldErrors = fetchResponse.data;
	}
	return response as FormResponse;
}

async function LoginUser(email: string, password: string, trustDevice: boolean): Promise<LoginResponse> {
	const data = {
		email: email,
		password: password,
	};
	const request = await apiRequest("/v1/login", "POST", data);
	const fetchResponse = await request.json();
	const response: Partial<LoginResponse> = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	if (response.Success) {
		if (!trustDevice) {
			window.onbeforeunload = (e: Event) => {
				ClearStorage();
				LogoutAllInstances();
				fetch(`${API_URL}/v1/logout`, {
					method: "POST",
					headers: buildHeaders(),
					keepalive: true,
					credentials: "include",
				});
			};
		}
		response.IsPendingEmailVerificaiton = fetchResponse.data.pendingEmailVerification;
		LoginAllInstances();
	} else {
		response.FieldErrors = fetchResponse.data;
		response.IsPendingEmailVerificaiton = false;
	}
	return response as LoginResponse;
}

async function ResendVerificationEmail(): Promise<ResponseCore> {
	const request = await apiRequest("/v1/resend-verification-email", "POST");
	const fetchResponse = await request.json();
	return buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
}

async function RefreshToken(): Promise<ResponseCore> {
	const request = await apiRequest("/v1/refresh-token", "POST");
	const fetchResponse = await request.json();
	const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	return response;
}
RefreshToken();

async function Logout() {
	ClearStorage();
	LogoutAllInstances();
	try {
		const request = await apiRequest("/v1/logout", "POST");
		if (request.ok) {
			location.href = location.origin;
		} else {
			console.error(`Failed to log out user on the server. ${request.status}: ${request.statusText}`);
			location.href = location.origin;
		}
	} catch (e) {
		location.href = location.origin;
	}
}

async function ResetPassword(password: string, verificationCode: string): Promise<FormResponse> {
	const data = {
		password: password,
		code: verificationCode,
	};
	const request = await apiRequest("/v1/reset-password", "POST", data);
	const fetchResponse = await request.json();
	const response: Partial<FormResponse> = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	if (!response.Success) {
		response.FieldErrors = fetchResponse.data;
	}
	return response as FormResponse;
}

async function VerifyAdmin(): Promise<ResponseCore> {
	const request = await apiRequest("/v1/admin/verify");
	const fetchResponse = await request.json();
	const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	return response;
}

async function VerifyUser(): Promise<ResponseCore> {
	try {
		const request = await apiRequest("/v1/user/verify");
		const fetchResponse = await request.json();
		const response = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
		return response;
	} catch (e) {
		return buildResponseCore(false, 502, "Your device does not currently have a network connection.");
	}
}

async function ForgotPassword(email: string): Promise<FormResponse> {
	const data = {
		email: email,
	};
	const request = await apiRequest("/v1/forgot-password", "POST", data);
	const fetchResponse = await request.json();
	const response: Partial<FormResponse> = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	if (!response.Success) {
		response.FieldErrors = fetchResponse.data;
	}
	return response as FormResponse;
}

async function MaintenanceCheck(): Promise<MaintenanceCheckReponse> {
	const request = await apiRequest("/v1/maintenance");
	const fetchResponse = await request.json();
	const response: Partial<MaintenanceCheckReponse> = buildResponseCore(fetchResponse.success, request.status, fetchResponse.error);
	if (response.Success) {
		response.IsUndergoingMaintenance = fetchResponse.data ? true : false;
	}
	return response as MaintenanceCheckReponse;
}
