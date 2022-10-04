import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OB } from '@prisma/client';
import { CreateObDto } from './dto/ob-dto';
import { ObEntity } from './entity/ob';
import { ObService } from './ob.service';

@Controller('ob')
export class ObController {
   constructor(private readonly service: ObService) {}

   @Get()
   @ApiOperation({ summary: 'OBのデータ全件取得' })
   @ApiOkResponse({ type: ObEntity, isArray: true })
   async getAll(): Promise<OB[]> {
      return this.service.getAllOb();
   }

   @Get('check/:uuid')
   @ApiOperation({ summary: 'OBのuuidの照合' })
   @ApiOkResponse({ type: ObEntity })
   async checkUuid(@Param('uuid') uuid: string): Promise<OB> {
      return this.service.checkObExist({ obId: uuid });
   }

   @Post()
   @ApiOperation({ summary: 'OBレコードの作成' })
   @ApiCreatedResponse({ type: ObEntity })
   async create(data: CreateObDto): Promise<OB> {
      return this.service.createOb(data);
   }

   @Delete(':uuid')
   @ApiOperation({ summary: 'OBレコードの削除' })
   @ApiResponse({ type: ObEntity })
   async delete(@Param('uuid') uuid: string): Promise<OB> {
      return this.service.deleteOb({ obId: uuid });
   }
}
