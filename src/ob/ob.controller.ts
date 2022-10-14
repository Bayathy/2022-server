// eslint-disable-next-line no-redeclare
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OB } from '@prisma/client';
import { createObDto } from './dto/ob.dto';
import { ObEntity } from './entity/ob.dto';
import { ObService } from './ob.service';

@ApiTags('ob')
@Controller('ob')
export class ObController {
   constructor(private readonly service: ObService) {}

   @Get()
   @ApiOperation({ summary: 'OBのデータ全件取得' })
   @ApiOkResponse({ type: ObEntity, isArray: true })
   async getAll(): Promise<OB[]> {
      return this.service.getAllOb();
   }
   @Get('/history')
   @ApiOperation({ summary: 'OBの入場履歴を返す'})
   async getAllSponsorHistory() : Promise<OB[]>{
      return this.service.getAllHistory()
   }

   @Get('check/:uuid')
   @ApiOperation({ summary: 'OBのuuidの照合' })
   @ApiOkResponse({ type: ObEntity, description: '存在しない場合はnullを返す' })
   async checkUuid(@Param('uuid') uuid: string): Promise<OB | null> {
      return this.service.checkObExist({ obId: uuid });
   }

   @Post()
   @ApiOperation({ summary: 'OBレコードの作成' })
   @ApiCreatedResponse({ type: ObEntity })
   async create(@Body() data: createObDto): Promise<OB> {
      return this.service.createOb(data);
   }

   @Delete(':uuid')
   @ApiOperation({ summary: 'OBレコードの削除' })
   @ApiResponse({ type: ObEntity })
   async delete(@Param('uuid') uuid: string): Promise<OB> {
      return this.service.deleteOb({ obId: uuid });
   }
}
