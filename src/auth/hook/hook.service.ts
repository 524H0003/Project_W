import { Injectable } from "@nestjs/common";
import { DatabaseRequests } from "app/utils/typeorm.utils";
import { Hook } from "./hook.entity";

@Injectable()
export class HookService extends DatabaseRequests<Hook> {
	
}
