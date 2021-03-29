import { nanoid } from 'nanoid'
/**
 * Abstract Entity containing `gid` and `id` parameters
 * for use with Slice.
 * 
 * The global id is assigned to `gid` on creation.
 * 
 * This has the added benefit of making the entity globally
 * unique from the point of creation.
 */
export abstract class Entity {
   public gid?:string;
   public id?:string;

   /**
    * The entity is assigned a global id by default
    * on construction.
    */
   constructor() {
       this.gid = nanoid();
   }
   
   /**
    * @param e The entity to compare to
    * @return true if the this entity is equal to `e`, false otherwise
    */  
   public equals(e: Entity) {
     return this.gid == e.gid
   }
}